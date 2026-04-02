"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import {
  Layout,
  Menu,
  Button,
  Drawer,
  ConfigProvider,
  theme,
  App as AntdApp,
  Space,
  Spin,
  Avatar,
} from "antd";
import {
  MenuOutlined,
  RocketOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import css from "./AppLayout.module.css";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const { Header, Content, Footer, Sider } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileVisible, setMobileVisible] = useState<boolean>(false);

  const { data: session, status } = useSession();

  // const userId = (session?.user as { id: string })?.id;
  const isLoading = status === "loading";
  const isAuth = status === "authenticated";
  const selectedKey = pathname.startsWith("/library") ? "library" : "create";

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
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link href="/profile">Profile</Link>,
    },
  ];

  const authBlock = (
    <div style={{ padding: "16px", borderTop: "1px solid #333" }}>
      {isLoading && <Spin size="small" />}
      {isAuth && (
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Space>
            <Avatar src={session?.user?.image} icon={<UserOutlined />} />
            <span style={{ color: "white" }}>{session?.user?.name}</span>
          </Space>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={() => signOut()}
            style={{ width: "100%", textAlign: "left" }}
          >
            Exit
          </Button>
        </Space>
      )}
    </div>
  );

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <AntdApp>
        <Layout style={{ minHeight: "100vh" }}>
          <Sider
            trigger={null}
            breakpoint="lg"
            collapsedWidth="0"
            theme="dark"
            className={css.desktopSider}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div style={{ flex: 1 }}>
                <h1 className={css.logo}>StoryMaker</h1>
                <Menu
                  theme="dark"
                  mode="inline"
                  selectedKeys={[selectedKey]}
                  items={menuItems}
                />
              </div>
              {authBlock}
            </div>
          </Sider>

          <Layout>
            <Header className={css.header}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileVisible(true)}
                className={`${css.mobileBurger} mobile-burger`}
              />
            </Header>

            <Content className={css.content}>
              <div className={css.innerContent}>{children}</div>
            </Content>

            <Footer className={css.footer}>StoryMaker Web ©2026</Footer>
          </Layout>

          <Drawer
            title="Menu"
            placement="left"
            onClose={() => setMobileVisible(false)}
            open={mobileVisible}
            styles={{
              body: { padding: 0, display: "flex", flexDirection: "column" },
            }}
          >
            <div style={{ flex: 1 }}>
              <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                items={menuItems}
                onClick={() => setMobileVisible(false)}
              />
            </div>
            {authBlock}
          </Drawer>
        </Layout>
      </AntdApp>
    </ConfigProvider>
  );
}
