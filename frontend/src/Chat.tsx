import { useReactiveVar } from '@apollo/client';
import { Button, Card, Col, Form, Input, Row } from 'antd';
import React, { useState, useEffect } from 'react';
import { socket } from './api';
import { EventType, Message, MessageType } from './types';
import { myNameVar } from './vars';

const { useForm, Item } = Form;

const Chat: React.FC = () => {
  const myName = useReactiveVar(myNameVar);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket.on(EventType.ChatMessage, (msg: Message) => {
      setMessages((msgs) => [...msgs, msg]);
    });

    return () => {
      socket.off(EventType.ChatMessage);
    };
  }, []);

  const [form] = useForm();

  return (
    <Card>
    <Row gutter={[16, 16]}>
      <Col span={ 24 }>
          {messages.map((msg, index) => (
            <div style={{ textAlign: 'start' }} key={index}>{ `${msg.name} - ${msg.message}` }</div>
          ))}
      </Col>
      <Col span={ 12 }>
        <Form 
          form={ form }
          onFinish={ values => {
            const message: Message = {
              name: values.name,
              message: values.message,
              type: MessageType.Text
            }

            socket.emit(EventType.ChatMessage, message);

            form.resetFields(['message']);
          }}
        >
          <Item 
            initialValue={ myName }
            name="name" 
            label="Name"
            required
            rules={[{ required: true, message: 'Message is required' }] }
          >
            <Input disabled/>
          </Item>
          <Item 
            name="message" 
            label="Message"
            required
            rules={[{ required: true, message: 'Message is required' }] }
          >
            <Input />
          </Item>
          <Button type="primary" htmlType="submit">
            Send
          </Button>
        </Form>
      </Col>
    </Row>
    </Card>
    
  );
};

export default Chat;
