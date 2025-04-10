import React, { useState } from 'react';
import { Button, Form, Input, Card, Typography, message } from 'antd';
import '../pages/LoginPage/LoginPage.css';

const { Title } = Typography;

const MFAStep = ({ email, onVerify, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await onVerify(values.code);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <div className="title-container">
                    <Title level={2} className="login-title">Verificación en Dos Pasos</Title>
                    <p>Ingresa el código de 6 dígitos de tu aplicación autenticadora</p>
                    <p style={{ fontWeight: 'bold' }}>{email}</p>
                </div>
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="code"
                        rules={[
                            { required: true, message: 'Ingrese el código de verificación' },
                            { pattern: /^\d{6}$/, message: 'El código debe tener 6 dígitos' }
                        ]}
                    >
                        <Input placeholder="Código de 6 dígitos" maxLength={6} />
                    </Form.Item>
                    <Form.Item>
                        <div className="button-container">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading} 
                                className="login-button"
                                block
                            >
                                Verificar
                            </Button>
                            <Button 
                                type="link" 
                                onClick={onBack}
                                style={{ marginTop: '10px' }}
                                block
                            >
                                Volver al inicio de sesión
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default MFAStep;