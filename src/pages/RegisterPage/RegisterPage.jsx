import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Card, Typography, message, Modal, QRCode, Divider } from 'antd';
import { authService } from '../../services/authService';
import './RegisterPage.css';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [mfaData, setMfaData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();
    const { registerUser } = useContext(authService);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await registerUser(values);

            setMfaData({
                secret: response.mfaSecret,
                qrCode: response.mfaQR,
                email: values.email
            });
            setIsModalVisible(true);

            message.success('Registro exitoso! Configura tu autenticador');
        } catch (error) {
            message.error('Registro fallido: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModalContinue = () => {
        setIsModalVisible(false);
        navigate('/');
    };

    return (
        <div className="register-container">
            <Card className="register-card">
                <div className="title-container">
                    <Title level={2} className="register-title">Registro</Title>
                </div>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Ingrese su nombre de usuario!' }]}
                    >
                        <Input placeholder="Nombre de usuario" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Ingrese su correo!' },
                            { type: 'email', message: 'Ingrese un correo válido!' },
                        ]}
                    >
                        <Input placeholder="Correo electrónico" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Ingrese su contraseña!' }]}
                    >
                        <Input.Password placeholder="Contraseña" />
                    </Form.Item>
                    <Form.Item>
                        <div className="button-container">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="register-button"
                                block
                            >
                                Registrar
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
                <div className="register-link">
                    <Link to="/">Regresar al inicio</Link>
                </div>
            </Card>

            {/* Modal para mostrar información MFA */}
            <Modal
                title="Configuración de Autenticación en Dos Pasos"
                open={isModalVisible}  // Cambiado de visible a open
                onOk={handleModalContinue}
                onCancel={handleModalContinue}
                cancelButtonProps={{ style: { display: 'none' } }}
                width={600}
                centered
            >
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ marginBottom: 20 }}>
                        Escanea este código QR con tu aplicación autenticadora
                    </Title>

                    {mfaData?.qrCode && (
                        <div style={{ margin: '0 auto 20px', maxWidth: 250 }}>
                            <QRCode
                                value={mfaData.qrCode}
                                size={200}
                                style={{ margin: '0 auto' }}
                            />
                        </div>
                    )}

                    <Divider>O ingresa manualmente este código</Divider>

                    <div style={{
                        background: '#f0f0f0',
                        padding: '15px',
                        borderRadius: '4px',
                        margin: '15px 0',
                        wordBreak: 'break-all',
                        textAlign: 'center'
                    }}>
                        <Text strong style={{ fontSize: '16px' }}>{mfaData?.secret}</Text>
                    </div>

                    <div style={{ textAlign: 'left', marginTop: '20px' }}>
                        <Title level={5} style={{ color: '#ff4d4f' }}>Instrucciones:</Title>
                        <ol>
                            <li>Descarga Google Authenticator, Authy o similar</li>
                            <li>Escanea el código QR o ingresa el código manualmente</li>
                            <li>Guarda el código secreto en un lugar seguro</li>
                            <li>Necesitarás este autenticador cada vez que inicies sesión</li>
                        </ol>
                    </div>

                    <Button
                        type="primary"
                        onClick={handleModalContinue}
                        style={{ marginTop: '20px' }}
                        block
                    >
                        Continuar al Inicio de Sesión
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default RegisterPage;