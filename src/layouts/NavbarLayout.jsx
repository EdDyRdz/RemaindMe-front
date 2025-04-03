import React from 'react';
import { Layout } from 'antd';
import Navbar from '../components/Navbar';

const { Content } = Layout;

const NavbarLayout = ({ children }) => {
  return (
    <Layout>
      <Navbar />
      <Content style={{ padding: '24px', background: '#fff', minHeight: '100vh' }}>
        {children}
      </Content>
    </Layout>
  );
};

export default NavbarLayout;