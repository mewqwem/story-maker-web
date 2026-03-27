"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Layout, Menu, Button, Drawer, ConfigProvider, theme, App } from "antd";
import { MenuOutlined, RocketOutlined, BookOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import Providers from "./providers";
import "./globals.css";
import css from "./layout.module.css";
import { usePathname } from "next/dist/client/components/navigation";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileVisible, setMobileVisible] = useState<boolean>(false);
  const selectedKey = pathname === "/library" ? "library" : "create";

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
                  <Sider
                    trigger={null}
                    breakpoint="lg"
                    collapsedWidth="0"
                    theme="dark"
                  >
                    <h1 className={css.logo}>StoryMaker</h1>
                    <Menu
                      theme="dark"
                      mode="inline"
                      defaultSelectedKeys={[selectedKey]}
                      items={menuItems}
                    />
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
                    styles={{ body: { padding: 0 } }}
                  >
                    <Menu
                      mode="inline"
                      defaultSelectedKeys={[selectedKey]}
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
