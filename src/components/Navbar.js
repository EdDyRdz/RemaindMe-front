import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Input, Dropdown, Avatar, Space, Button } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import "../App.css";

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("1");

  useEffect(() => {
    if (location.pathname.includes("/home")) {
      setSelectedKey("1");
    } else if (location.pathname.includes("/contact")) {
      setSelectedKey("2");
    } else {
      setSelectedKey("");
    }
  }, [location.pathname]);

  const handleSearch = (value) => {
    console.log("Buscando:", value);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const handleProfile = () => {
    navigate("/profile");
  };

  const profileMenu = (
    <Menu className="profile-menu">
      <Menu.Item key="1">
        <Button className="profile-menu-item" type="primary" icon={<UserOutlined />} onClick={handleProfile}>
          Ver Perfil
        </Button>
      </Menu.Item>
      <Menu.Item key="2">
        <Button className="profile-menu-item ant-btn-danger" icon={<LogoutOutlined />} onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="navbar">

      <Menu className="navbar-menu" mode="horizontal" selectedKeys={[selectedKey]}>
        <Menu.Item key="1">
          <Link to="/home">Inicio</Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/contact">Contacto</Link>
        </Menu.Item>
      </Menu>

      <Dropdown overlay={profileMenu} placement="bottomRight">
        <Space>
          <Avatar className="navbar-avatar" size="large" icon={<UserOutlined />} />
        </Space>
      </Dropdown>
    </Header>
  );
};

export default Navbar;
