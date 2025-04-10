import React, { useState } from 'react';
import { Button, Form, Input, Card, Typography, message, Steps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AuthPages.css';

const { Title, Text } = Typography;
const { Step } = Steps;

const ForgotPassword = () => {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const navigate = useNavigate();

    const handleEmailSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { email: values.email });
            message.success(response.data.message);
            setEmail(values.email);
            setResetToken(response.data.resetToken); // En producción esto vendría por email
            setStep(1);
        } catch (error) {
            message.error(error.response?.data?.error || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token: resetToken,
                newPassword: values.newPassword
            });
            message.success('Contraseña restablecida exitosamente');
            navigate('/login');
        } catch (error) {
            message.error(error.response?.data?.error || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Ingresa tu email',
            content: (
                <Form onFinish={handleEmailSubmit} layout="vertical">
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Por favor ingresa tu email' },
                            { type: 'email', message: 'Ingresa un email válido' }
                        ]}
                    >
                        <Input placeholder="Correo electrónico registrado" />
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            block
                        >
                            Enviar enlace de restablecimiento
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Text>
                            <Link to="/login">Volver al inicio de sesión</Link>
                        </Text>
                    </div>
                </Form>
            )
        },
        {
            title: 'Nueva contraseña',
            content: (
                <Form onFinish={handleResetPassword} layout="vertical">
                    <Form.Item
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Por favor ingresa tu nueva contraseña' },
                            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                        ]}
                    >
                        <Input.Password placeholder="Nueva contraseña" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Por favor confirma tu contraseña' },
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
                        <Input.Password placeholder="Confirmar nueva contraseña" />
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            block
                        >
                            Restablecer contraseña
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Button type="link" onClick={() => setStep(0)}>
                            Volver atrás
                        </Button>
                    </div>
                </Form>
            )
        }
    ];

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="title-container">
                    <Title level={2} className="auth-title">Restablecer contraseña</Title>
                    <Text type="secondary" className="auth-subtitle">
                        {step === 0 ? 
                            "Ingresa tu email para recibir instrucciones" : 
                            "Crea una nueva contraseña segura"}
                    </Text>
                </div>

                <Steps current={step} size="small" className="auth-steps">
                    {steps.map((item) => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>

                <div className="auth-form-container">
                    {steps[step].content}
                </div>
            </Card>
        </div>
    );
};

export default ForgotPassword;