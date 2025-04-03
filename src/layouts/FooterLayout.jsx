import React from 'react';
import { Layout, Badge, Typography} from 'antd';
import moment from 'moment';

const { Footer } = Layout;
const { Text } = Typography;

const statusColors = {
  "In Progress": "gold",
  "Revision": "blue",
  "Paused": "red",
  "Done": "green"
};

const statusTranslations = {
  "In Progress": "En Progreso",
  "Revision": "En Revisión",
  "Paused": "Pausada",
  "Done": "Finalizada"
};

const FooterLayout = ({ children, selectedTask, onDeleteTask }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {children}
      <Footer style={{ 
        background: '#f0f2f5', 
        padding: '16px 24px',
        borderTop: '1px solid #d9d9d9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {selectedTask ? (
          <>
            <div>
              <Text strong style={{ marginRight: 8 }}>Tarea seleccionada:</Text>
              <Text>{selectedTask.nametask}</Text>
              <Badge 
                color={statusColors[selectedTask.status]} 
                text={statusTranslations[selectedTask.status]} 
                style={{ marginLeft: 16 }}
              />
            </div>
            <div>
              <Text type="secondary" style={{ marginRight: 16 }}>
                Fecha límite: {moment(selectedTask.dead_line).format('LL')}
              </Text>
              <Text type="secondary">
                Categoría: {selectedTask.category}
              </Text>
            </div>
          </>
        ) : (
          <Text type="secondary">Selecciona una tarea para ver los detalles</Text>
        )}
      </Footer>
    </Layout>
  );
};

export default FooterLayout;