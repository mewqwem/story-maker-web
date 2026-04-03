"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  Avatar,
  Typography,
  Descriptions,
  Spin,
  Row,
  Col,
  Flex,
  Tag,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import css from "./UserProfile.module.css";

const { Title, Text } = Typography;

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "50vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "50vh" }}>
        <Text type="danger">User is not authenticated</Text>
      </Flex>
    );
  }

  const user = session.user as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
  };

  return (
    <div className={css.profileContainer}>
      <Card className={css.profileCard} variant="borderless">
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} sm={8} md={6} style={{ textAlign: "center" }}>
            <Avatar
              size={120}
              src={user.image}
              icon={<UserOutlined />}
              className={css.avatar}
            />
          </Col>
          <Col xs={24} sm={16} md={18}>
            <Title level={2} style={{ marginTop: 0, marginBottom: 16 }}>
              {user.name}
            </Title>

            <Flex vertical gap="small">
              <div className={css.infoItem}>
                <MailOutlined className={css.icon} />
                <Text>{user.email}</Text>
              </div>
              <div className={css.infoItem}>
                <IdcardOutlined className={css.icon} />
                <Text type="secondary" copyable={{ text: user.id }}>
                  ID: {user.id}
                </Text>
              </div>
            </Flex>

            <div style={{ marginTop: 16 }}>
              <Tag icon={<SafetyCertificateOutlined />} color="success">
                Active Account
              </Tag>
              <Tag color="processing">Google SSO</Tag>
            </div>
          </Col>
        </Row>
      </Card>

      <Title level={4} style={{ marginTop: 32 }}>
        Account Details
      </Title>
      <Card variant={"outlined"} className={css.detailsCard}>
        <Descriptions
          column={1}
          labelStyle={{ color: "#8c8c8c", minWidth: "200px", fontSize: "16px" }}
          contentStyle={{ color: "#e6e6e6", fontSize: "16px" }}
        >
          <Descriptions.Item label="Full Name">
            {user.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user.email || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
