import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Card, Typography, message } from 'antd';
import { authService } from '../../services/authService';
import './LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loginData, setLoginData] = useState(null);
    const navigate = useNavigate();
    const { loginUser, verifyMFA } = useContext(authService);

    const handleCredentialsSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await loginUser(values.email, values.password);

            if (response.mfaRequired) {
                setLoginData({
                    email: values.email,
                    tempToken: response.tempToken
                });
                setStep(2);
            } else {
                message.error('Respuesta inesperada del servidor');
            }
        } catch (error) {
            message.error('Error al iniciar sesión: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMFAVerify = async (values) => {
        setLoading(true);
        try {
            const response = await verifyMFA(loginData.tempToken, values.code);

            if (response.token) {
                localStorage.setItem('token', response.token);
                message.success('¡Inicio de sesión exitoso!');
                navigate('/home');
            }
        } catch (error) {
            message.error('Error al verificar código: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                {step === 1 ? (
                    <>
                        <div className="title-container">
                            <Title level={2} className="login-title">Iniciar Sesión</Title>
                        </div>
                        <Form onFinish={handleCredentialsSubmit} layout="vertical">
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Ingrese su nombre de usuario' }]}
                            >
                                <Input placeholder="Nombre de usuario" />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Ingrese su correo electrónico' },
                                    { type: 'email', message: 'Correo no válido' }
                                ]}
                            >
                                <Input placeholder="Correo electrónico" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Ingrese su contraseña' }]}
                            >
                                <Input.Password placeholder="Contraseña" />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="login-button"
                                    block
                                >
                                    Iniciar Sesión
                                </Button>
                            </Form.Item>
                        </Form>
                        <div className="register-link">
                            <Text>
                                ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                            </Text>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="title-container">
                            <Title level={2} className="login-title">Verificación en Dos Pasos</Title>
                        </div>
                        <Text>
                            Por favor, ingresa el código de 6 dígitos generado por tu aplicación autenticadora
                        </Text>
                        <Text strong style={{ display: 'block', margin: '10px 0 20px' }}>
                            {loginData.email}
                        </Text>

                        <Form onFinish={handleMFAVerify} layout="vertical">
                            <Form.Item
                                name="code"
                                rules={[
                                    { required: true, message: 'Ingrese el código de verificación' },
                                    { pattern: /^\d{6}$/, message: 'El código debe tener 6 dígitos' }
                                ]}
                            >
                                <Input
                                    placeholder="Código de 6 dígitos"
                                    maxLength={6}
                                    style={{ letterSpacing: '2px', textAlign: 'center' }}
                                    autoComplete='off'
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="login-button"
                                    block
                                >
                                    Verificar y Continuar
                                </Button>
                                <Button
                                    type="link"
                                    onClick={() => setStep(1)}
                                    block
                                    style={{ marginTop: '10px' }}
                                >
                                    Volver al inicio de sesión
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Card>
        </div>
    );
};

export default LoginPage;