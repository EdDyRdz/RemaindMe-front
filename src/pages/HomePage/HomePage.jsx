import React, { useState, useEffect, useContext } from 'react';
import {
  Button, Typography, Layout, Modal, Form, Input, Select, DatePicker, message, List, Tag, Space, Spin, 
  Row, Col, Card, Progress, Tabs, Popconfirm, notification
} from 'antd';
import {
  PlusCircleOutlined, ClockCircleOutlined, CheckCircleOutlined, PauseCircleOutlined, EyeOutlined, FireOutlined, 
  CalendarOutlined, UnorderedListOutlined, DeleteOutlined
} from '@ant-design/icons';
import { taskService } from '../../services/taskService';
import { authService } from '../../services/authService';
import moment from 'moment';
import FooterLayout from '../../layouts/FooterLayout';
import NavbarLayout from '../../layouts/NavbarLayout';

const { Content } = Layout;
const { Title, Text } = Typography;

const HomePage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTask, setSelectedTask] = useState(null);
  const [form] = Form.useForm();
  const { user, logoutUser } = useContext(authService);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No autenticado");
        }

        const tasksData = await taskService.getTasks();
        setTasks(tasksData);

      } catch (error) {
        console.error("Error al obtener tareas:", error);
        if (error.message.includes("401") || error.message.includes("autenticación")) {
          message.error("Sesión expirada. Por favor, vuelve a iniciar sesión");
          logoutUser();
        } else {
          message.error(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user, logoutUser]);

  useEffect(() => {
    if (!user) return;

    const reminderCache = new Map();
    let pollingInterval;

    const checkReminders = async () => {
      try {
        const now = moment();
        const activeReminders = await taskService.checkForActiveReminders();

        tasks.forEach(task => {
          if (task.status === 'Done' && reminderCache.has(task._id)) {
            const cached = reminderCache.get(task._id);
            notification.destroy(cached.notificationKey);
            reminderCache.delete(task._id);
          }
        });

        activeReminders.forEach(reminder => {
          const cached = reminderCache.get(reminder.taskId);
          const task = tasks.find(t => t._id === reminder.taskId);

          if (!task || task.status === 'Done') {
            if (cached) {
              notification.destroy(cached.notificationKey);
              reminderCache.delete(reminder.taskId);
            }
            return;
          }

          const reminderTime = moment(reminder.reminderTime);
          const diffSeconds = reminderTime.diff(now, 'seconds');

          if (diffSeconds >= 0 && diffSeconds <= 5) {
            if (cached) {
              notification.destroy(cached.notificationKey);
            }

            const notificationKey = `reminder-${reminder.taskId}-${now.valueOf()}`;
            showReminderNotification(reminder, notificationKey);

            reminderCache.set(reminder.taskId, {
              lastNotifiedAt: now.valueOf(),
              notificationKey
            });
          }
        });

      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };

    const showReminderNotification = (reminderData, notificationKey) => {
      const task = tasks.find(t => t._id === reminderData.taskId);
      if (!task) return;

      const reminderTime = moment(reminderData.reminderTime);
      const formattedTime = reminderTime.format('DD/MM/YYYY HH:mm:ss');

      notification.open({
        message: 'Recordatorio',
        description: (
          <div>
            <p>{reminderData.message}</p>
            <p>Hora exacta: {formattedTime}</p>
            <p>Hora actual: {moment().format('HH:mm:ss')}</p>
          </div>
        ),
        key: notificationKey,
        duration: 0,
        placement: 'bottomRight',
        onClick: () => {
          setSelectedTask(task);
          notification.destroy(notificationKey);
        }
      });
    };

    pollingInterval = setInterval(checkReminders, 5000);
    checkReminders();

    return () => {
      clearInterval(pollingInterval);
      notification.destroy();
    };
  }, [user, tasks]);

  const showModal = () => {
    if (!user) {
      message.warning("Debes iniciar sesión para crear tareas");
      return;
    }
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formattedValues = {
        ...values,
        dead_line: values.dead_line.toISOString(),
        remind_me: values.remind_me?.toISOString(),
        createdBy: user._id
      };

      const data = await taskService.createTask(formattedValues);
      const newTask = {
        ...data.task,
        dead_line: moment(data.task.dead_line),
        remind_me: data.task.remind_me ? moment(data.task.remind_me) : null
      };

      setTasks([...tasks, newTask]);
      message.success("Tarea creada exitosamente");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      if (error.message.includes("401")) {
        message.error("Sesión expirada. Por favor, vuelve a iniciar sesión");
        logoutUser();
      } else {
        message.error(error.message || "Error al crear la tarea");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      const updatedTasks = tasks.map(t =>
        t._id === taskId ? { ...t, status: newStatus } : t
      );
      setTasks(updatedTasks);

      await taskService.updateTaskStatus(taskId, newStatus);

      if (newStatus === 'Done') {
        notification.destroy(`reminder-${taskId}`);
      }

      message.success("Estado de tarea actualizado");
    } catch (error) {
      console.error("Error al actualizar estado de la tarea:", error);

      const originalTasks = tasks.map(t =>
        t._id === taskId ? { ...t, status: t.status } : t
      );
      setTasks(originalTasks);

      if (error.message.includes("401")) {
        message.error("Sesión expirada. Por favor, vuelve a iniciar sesión");
        logoutUser();
      } else {
        message.error("Error al actualizar el estado");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      const updatedTasks = tasks.filter(t => t._id !== taskId);
      setTasks(updatedTasks);

      notification.destroy(`reminder-${taskId}`);

      if (selectedTask?._id === taskId) {
        setSelectedTask(null);
      }
      message.success("Tarea eliminada");
    } catch (error) {
      console.error("Error al eliminar:", error);
      message.error("No se pudo eliminar la tarea");
    }
  };

  const statusData = {
    "In Progress": { color: "gold", icon: <ClockCircleOutlined />, text: "En Progreso" },
    "Revision": { color: "blue", icon: <EyeOutlined />, text: "En Revisión" },
    "Paused": { color: "red", icon: <PauseCircleOutlined />, text: "Pausada" },
    "Done": { color: "green", icon: <CheckCircleOutlined />, text: "Finalizada" }
  };

  const getPriorityColor = (deadline) => {
    if (!deadline) return 'gray';
    const daysLeft = moment(deadline).diff(moment(), 'days');
    if (daysLeft < 0) return 'red';
    if (daysLeft <= 2) return 'orange';
    if (daysLeft <= 5) return 'yellow';
    return 'green';
  };

  const getPriorityLevel = (deadline) => {
    if (!deadline) return 0;
    const daysLeft = moment(deadline).diff(moment(), 'days');
    if (daysLeft < 0) return 4;
    if (daysLeft <= 2) return 3;
    if (daysLeft <= 5) return 2;
    return 1;
  };

  const filteredTasks = isSearching
    ? searchResults
    : tasks.filter(task => {
      if (task.createdBy !== user?._id) return false;

      switch (activeTab) {
        case 'active':
          return task.status !== 'Done';
        case 'completed':
          return task.status === 'Done';
        case 'urgent':
          return getPriorityLevel(task.dead_line) >= 3 && task.status !== 'Done';
        default:
          return true;
      }
    });

  const taskStats = {
    total: tasks.filter(t => t.createdBy === user?._id).length,
    completed: tasks.filter(t => t.createdBy === user?._id && t.status === 'Done').length,
    urgent: tasks.filter(t =>
      t.createdBy === user?._id &&
      t.status !== 'Done' &&
      getPriorityLevel(t.dead_line) >= 3
    ).length,
  };

/*   const groupTasksByDate = (tasks) => {
    const grouped = {};
    
    tasks.forEach(task => {
      const dateKey = task.dead_line ? moment(task.dead_line).format('DD/MM/YYYY') : 'Sin fecha';
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(task);
    });
    
    return grouped;
  }; */

  const renderTaskCards = () => {
    // Agrupar tareas por fecha
    const groupedTasks = {};
    
    filteredTasks.forEach(task => {
      const dateKey = task.dead_line ? moment(task.dead_line).format('DD/MM/YYYY') : 'Sin fecha';
      
      if (!groupedTasks[dateKey]) {
        groupedTasks[dateKey] = [];
      }
      
      groupedTasks[dateKey].push(task);
    });
  
    // Ordenar las fechas
    const dates = Object.keys(groupedTasks).sort((a, b) => {
      if (a === 'Sin fecha') return 1;
      if (b === 'Sin fecha') return -1;
      return moment(a, 'DD/MM/YYYY').diff(moment(b, 'DD/MM/YYYY'));
    });
  
    // Ordenar tareas por hora dentro de cada fecha
    dates.forEach(date => {
      groupedTasks[date].sort((a, b) => {
        if (!a.dead_line) return 1;
        if (!b.dead_line) return -1;
        return moment(a.dead_line).diff(moment(b.dead_line));
      });
    });
  
    return (
      <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
        <Row gutter={[16, 16]} style={{ flexWrap: 'nowrap' }}>
          {dates.map(date => (
            <Col key={date} style={{ minWidth: '350px' }}> {/* Aumenté el ancho mínimo */}
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    <Text strong>{date}</Text>
                    <Tag>{groupedTasks[date].length}</Tag>
                  </Space>
                }
                style={{ 
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                headStyle={{
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <List
                  dataSource={groupedTasks[date]}
                  renderItem={task => (
                    <List.Item
                      style={{
                        padding: '16px',
                        borderLeft: `4px solid ${statusData[task.status]?.color || 'gray'}`,
                        marginBottom: '12px',
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                      }}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div style={{ width: '100%' }}>
                        {/* Primera fila: Hora y título */}
                        <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
                          <Col>
                            <Text strong style={{ fontSize: '15px' }}>
                              {task.nametask}
                            </Text>
                          </Col>
                          <Col>
                            {task.dead_line && (
                              <Tag color="blue">
                                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                                {moment(task.dead_line).format('HH:mm')}
                              </Tag>
                            )}
                          </Col>
                        </Row>
                        
                        {/* Segunda fila: Descripción */}
                        <Row style={{ marginBottom: '12px' }}>
                          <Col span={24}>
                            <Text 
                              type="secondary" 
                              style={{ 
                                fontSize: '13px',
                                display: 'block',
                                whiteSpace: 'pre-line'
                              }}
                            >
                              {task.description}
                            </Text>
                          </Col>
                        </Row>
                        
                        {/* Tercera fila: Tags y acciones */}
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Space size={4} wrap>
                              <Tag color={getPriorityColor(task.dead_line)}>
                                {task.category}
                              </Tag>
                              {task.remind_me && (
                                <Tag icon={<ClockCircleOutlined />} color="purple">
                                  Recordar: {moment(task.remind_me).format('HH:mm')}
                                </Tag>
                              )}
                            </Space>
                          </Col>
                          <Col>
                            <Space>
                              <Select
                                value={task.status}
                                size="small"
                                style={{ width: '120px' }}
                                onChange={(value) => handleStatusChange(task._id, value)}
                                disabled={loading}
                              >
                                {Object.entries(statusData).map(([statusKey, statusInfo]) => (
                                  <Select.Option key={statusKey} value={statusKey}>
                                    <Space>
                                      {statusInfo.icon}
                                      {statusInfo.text}
                                    </Space>
                                  </Select.Option>
                                ))}
                              </Select>
                              <Popconfirm
                                title="¿Eliminar esta tarea?"
                                onConfirm={() => handleDeleteTask(task._id)}
                              >
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Popconfirm>
                            </Space>
                          </Col>
                        </Row>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <NavbarLayout>
      <FooterLayout selectedTask={selectedTask}>
        <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={3} style={{ margin: 0 }}>
                      {user ? `Hola, ${user.username}` : 'RemaindMe'}
                    </Title>
                    <Text type="secondary">
                      {user ? `Tienes ${filteredTasks.length} tareas ${activeTab === 'active' ? 'pendientes' : activeTab === 'completed' ? 'completadas' : 'urgentes'}` : 'Inicia sesión para ver tus tareas'}
                    </Text>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={showModal}
                    >
                      Nueva Tarea
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Row gutter={[24, 24]} style={{ height: '100%' }}>
                <Col xs={24} sm={8}>
                  <Card style={{ height: '100%' }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text strong>Total de tareas</Text>
                      <Progress
                        percent={taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}
                        status={taskStats.completed === taskStats.total && taskStats.total > 0 ? 'success' : 'active'}
                      />
                      <Row justify="space-between">
                        <Col>
                          <Tag color="green">{taskStats.completed} completadas</Tag>
                        </Col>
                        <Col>
                          <Tag color="blue">{taskStats.total} total</Tag>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} sm={8}>
                  <Card style={{ height: '100%' }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text strong>Tareas urgentes</Text>
                      <Progress
                        percent={taskStats.urgent > 0 ? 100 : 0}
                        status={taskStats.urgent > 0 ? 'exception' : 'success'}
                        format={() => taskStats.urgent}
                      />
                      <Text type="secondary">
                        {taskStats.urgent > 0
                          ? `${taskStats.urgent} tareas con alta prioridad`
                          : 'No hay tareas urgentes'}
                      </Text>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} sm={8}>
                  <Card style={{ height: '100%', minHeight: '160px' }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text strong>Próximas fechas</Text>
                      {tasks
                        .filter(t =>
                          t.createdBy === user?._id &&
                          t.dead_line &&
                          !t.dead_line.isBefore(moment()) &&
                          t.status !== "Done"
                        )
                        .sort((a, b) => a.dead_line - b.dead_line)
                        .slice(0, 2)
                        .map(task => (
                          <div key={task._id}>
                            <Text ellipsis style={{ display: 'block' }}>
                              <CalendarOutlined style={{ marginRight: 8 }} />
                              {moment(task.dead_line).format('DD/MM')} - {task.nametask}
                            </Text>
                          </div>
                        ))}
                      {tasks.filter(t =>
                        t.createdBy === user?._id &&
                        t.dead_line &&
                        !t.dead_line.isBefore(moment()) &&
                        t.status !== "Done"
                      ).length === 0 && (
                          <Text type="secondary">No hay fechas próximas</Text>
                        )}
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Card>
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  tabBarExtraContent={
                    <Text strong style={{ marginRight: 16 }}>
                      Mostrando {filteredTasks.length} tareas
                    </Text>
                  }
                  items={[
                    {
                      key: 'active',
                      label: (
                        <span>
                          <UnorderedListOutlined />
                          Activas
                        </span>
                      ),
                    },
                    {
                      key: 'completed',
                      label: (
                        <span>
                          <CheckCircleOutlined />
                          Completadas
                        </span>
                      ),
                    },
                    {
                      key: 'urgent',
                      label: (
                        <span>
                          <FireOutlined />
                          Urgentes
                        </span>
                      ),
                    },
                  ]}
                />
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  renderTaskCards()
                )}
              </Card>
            </Col>
          </Row>

          <Modal
            title="Crear Nueva Tarea"
            open={isModalVisible}
            onCancel={handleCancel}
            onOk={handleOk}
            confirmLoading={loading}
            width={700}
            okText="Crear Tarea"
            cancelText="Cancelar"
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="nametask"
                    label="Nombre"
                    rules={[{ required: true, message: "Nombre requerido" }]}
                  >
                    <Input placeholder="Nombre de la tarea" autoComplete='off' />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Categoría"
                    initialValue="Work"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Select.Option value="Work">Trabajo</Select.Option>
                      <Select.Option value="Study">Estudio</Select.Option>
                      <Select.Option value="Personal">Personal</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Descripción"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={3} placeholder="Descripción detallada" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    help={form.getFieldValue('dead_line')
                      ? `El recordatorio debe ser antes de ${moment(form.getFieldValue('dead_line')).format('LLL')}`
                      : 'Selecciona primero la fecha límite'}
                    name="dead_line"
                    label="Fecha Límite"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: '100%' }}
                      disabledDate={(current) => current && current < moment().startOf('day')}
                      onChange={() => {
                        const deadLine = form.getFieldValue('dead_line');
                        const remindMe = form.getFieldValue('remind_me');

                        if (remindMe && deadLine && moment(remindMe) > moment(deadLine)) {
                          form.setFieldsValue({ remind_me: null });
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="remind_me"
                    label="Recordatorio"
                    dependencies={['dead_line']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();
                          const deadLine = getFieldValue('dead_line');
                          if (deadLine && moment(value).isAfter(moment(deadLine))) {
                            return Promise.reject('El recordatorio debe ser antes de la fecha límite');
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: '100%' }}
                      disabledDate={(current) => current && current < moment().startOf('day')}
                      disabledTime={(current) => {
                        if (!current) return {};
                        if (current.isSame(moment(), 'day')) {
                          const now = moment();
                          return {
                            disabledHours: () => Array.from({ length: 24 }, (_, i) => i)
                              .filter(hour => hour < now.hour()),
                            disabledMinutes: (selectedHour) => {
                              if (selectedHour === now.hour()) {
                                return Array.from({ length: 60 }, (_, i) => i)
                                  .filter(minute => minute < now.minute());
                              }
                              return [];
                            }
                          };
                        }
                        return {};
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="status"
                label="Estado"
                initialValue="In Progress"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="In Progress">En progreso</Select.Option>
                  <Select.Option value="Done">Finalizada</Select.Option>
                  <Select.Option value="Paused">Pausada</Select.Option>
                  <Select.Option value="Revision">En revisión</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </FooterLayout>
    </NavbarLayout>
  );
};

export default HomePage;