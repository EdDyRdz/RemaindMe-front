import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  /* CheckCircleOutlined, */
  SettingOutlined,
} from '@ant-design/icons';
import Navbar from '../components/Navbar';

const { Sider, Content } = Layout;

const MainLayout = () => {


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout>
        <Sider theme="light">
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <h3>Task Manager</h3>
          </div>
          <Menu mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" icon={<HomeOutlined />}>
              <Link to="/profile">Inicio</Link>
            </Menu.Item>
            {/* <Menu.Item key="2" icon={<CheckCircleOutlined />}>
              <Link to="/profile/date">Fecha y Hora</Link>
            </Menu.Item> */}
            <Menu.Item key="2" icon={<SettingOutlined/>}>
              <Link to="/profile/config">Configuración</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        <Content style={{ padding: '24px', backgroundColor: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;