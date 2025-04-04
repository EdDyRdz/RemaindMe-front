import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Modal, Typography, message } from 'antd';

const { Title } = Typography;

const ProfilePage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isMFAModalVisible, setIsMFAModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [mfaForm] = Form.useForm();
  const [tempToken, setTempToken] = useState(null);
  const [passwordData, setPasswordData] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/currentUser", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
          form.setFieldsValue(data);
        } else {
          console.error("Error al obtener la información del usuario");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      }
    };

    fetchCurrentUser();
  }, [form]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showPasswordModal = () => {
    setIsPasswordModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePasswordCancel = () => {
    setIsPasswordModalVisible(false);
    passwordForm.resetFields();
  };

  const handleMFACancel = () => {
    setIsMFAModalVisible(false);
    mfaForm.resetFields();
  };

  const handleUpdate = async (values) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/updateUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setCurrentUser({ ...currentUser, ...values });
        setIsModalVisible(false);
        message.success("Perfil actualizado correctamente");
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Error al actualizar la información");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      message.error("Error de conexión al servidor");
    }
  };

  const handlePasswordSubmit = async (values) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Guardamos los datos de la nueva contraseña temporalmente
      setPasswordData({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      // Solo verificamos la contraseña actual y solicitamos MFA
      const response = await fetch("http://localhost:5000/api/requestPasswordChange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: values.currentPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setTempToken(data.tempToken);
        setIsPasswordModalVisible(false);
        setIsMFAModalVisible(true);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Error al verificar la contraseña");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      message.error("Error de conexión al servidor");
    }
  };

  const handleMFAVerify = async (values) => {
    try {
      const response = await fetch("http://localhost:5000/api/verifyPasswordChange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tempToken,
          mfaCode: values.mfaCode,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }),
      });

      if (response.ok) {
        message.success("Contraseña cambiada correctamente");
        setIsMFAModalVisible(false);
        mfaForm.resetFields();
        passwordForm.resetFields();
        setPasswordData(null); // Limpiar datos temporales
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      message.error("Error de conexión al servidor");
    }
  };

  return (
    <div>
      <Title level={2}>Perfil de Usuario</Title>
      {currentUser && (
        <div>
          <p><strong>Nombre:</strong> {currentUser.username}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <Button type="default" onClick={showPasswordModal}>
            Cambiar Contraseña
          </Button>
        </div>
      )}
      
      <Modal
        title="Editar Perfil"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[{ required: true, type: 'email', message: 'Ingresa un correo válido' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Guardar Cambios</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        title="Cambiar Contraseña"
        visible={isPasswordModalVisible}
        onCancel={handlePasswordCancel}
        footer={null}
      >
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordSubmit}>
          <Form.Item
            name="currentPassword"
            label="Contraseña Actual"
            rules={[{ required: true, message: 'Por favor ingresa tu contraseña actual' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Nueva Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa tu nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar Nueva Contraseña"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Por favor confirma tu nueva contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Continuar</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Verificación MFA */}
      <Modal
        title="Verificación en Dos Pasos"
        visible={isMFAModalVisible}
        onCancel={handleMFACancel}
        footer={null}
      >
        <p>Por favor ingresa el código de 6 dígitos de tu aplicación autenticadora</p>
        <Form form={mfaForm} layout="vertical" onFinish={handleMFAVerify}>
          <Form.Item
            name="mfaCode"
            label="Código de Verificación"
            rules={[
              { required: true, message: 'Por favor ingresa el código de verificación' },
              { pattern: /^\d{6}$/, message: 'El código debe tener 6 dígitos' }
            ]}
          >
            <Input placeholder="123456" maxLength={6} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Verificar y Cambiar Contraseña</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;