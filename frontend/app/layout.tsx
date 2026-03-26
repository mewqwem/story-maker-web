"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Layout, Menu, Button, Drawer, ConfigProvider, theme, App } from "antd";
import {
  MenuOutlined,
  RocketOutlined,
  BookOutlined,
  HistoryOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import Providers from "./providers";
import "./globals.css";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

export default function RootLayout({ children }: { children: ReactNode }) {
  const [mobileVisible, setMobileVisible] = useState<boolean>(false);

  const menuItems: MenuItem[] = [
    {
      key: "create",
      icon: <RocketOutlined />,
      label: <Link href="/">Create</Link>,
    },
    {
      key: "library",
      icon: <BookOutlined />,
      label: <Link href="/library">Library</Link>,
    },
  ];

  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <Providers>
              <App>
                <Layout style={{ minHeight: "100vh" }}>
                  <Sider breakpoint="lg" collapsedWidth="0" theme="dark">
                    <div
                      style={{
                        height: 32,
                        margin: 16,
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: 6,
                      }}
                    />
                    <Menu
                      theme="dark"
                      mode="inline"
                      defaultSelectedKeys={["create"]}
                      items={menuItems}
                    />
                  </Sider>

                  <Layout>
                    <Header
                      style={{
                        padding: "0 16px",
                        background: "#001529",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileVisible(true)}
                        style={{
                          color: "white",
                          fontSize: "18px",
                          marginRight: "16px",
                        }}
                        className="mobile-burger"
                      />
                      <span style={{ color: "white", fontWeight: "bold" }}>
                        STORYMAKER WEB
                      </span>
                    </Header>

                    <Content style={{ margin: "24px 16px 0" }}>
                      <div
                        style={{
                          padding: 24,
                          minHeight: 360,
                          background: "#141414",
                          borderRadius: 8,
                        }}
                      >
                        {children}
                      </div>
                    </Content>

                    <Footer style={{ textAlign: "center", color: "#444" }}>
                      StoryMaker Web ©2026
                    </Footer>
                  </Layout>

                  <Drawer
                    title="Menu"
                    placement="left"
                    onClose={() => setMobileVisible(false)}
                    open={mobileVisible}
                    styles={{ body: { padding: 0 } }}
                  >
                    <Menu
                      mode="inline"
                      defaultSelectedKeys={["create"]}
                      items={menuItems}
                      onClick={() => setMobileVisible(false)}
                    />
                  </Drawer>
                </Layout>
              </App>
            </Providers>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
