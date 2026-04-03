"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Tabs,
  Button,
  Input,
  Modal,
  Form,
  App,
  Card,
  Typography,
  Empty,
  Space,
  Popconfirm,
  Flex,
  Select,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  AudioOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ILibraryItem {
  _id?: string;
  name: string;
  content: string;
  type: "story" | "seo" | "image" | "voice";
  service?: "11labs" | "genai";
  language?: string;
}

const BASE_URL =
  "https://story-maker-web-932514732600.europe-west1.run.app/library";

const PromptManager = ({ type }: { type: ILibraryItem["type"] }) => {
  const { message } = App.useApp();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ILibraryItem | null>(null);
  const [form] = Form.useForm<ILibraryItem>();

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery<ILibraryItem[]>({
    queryKey: ["library", type, (session?.user as { id?: string })?.id],
    queryFn: async () => {
      const userId = (session?.user as { id?: string })?.id;
      const res = await axios.get(`${BASE_URL}?type=${type}`, {
        headers: {
          "x-user-id": userId,
        },
      });
      return res.data;
    },
    enabled: !!(session?.user as { id?: string })?.id,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isError) message.error("Backend connection failed.");
  }, [isError, message]);

  const saveMutation = useMutation({
    mutationFn: async (values: ILibraryItem) => {
      const isEdit = !!editingItem?._id;
      const url = isEdit ? `${BASE_URL}/${editingItem?._id}` : BASE_URL;

      return axios({
        method: isEdit ? "PATCH" : "POST",
        url,
        data: { ...values, type },
        headers: {
          "x-user-id": (session?.user as { id?: string })?.id,
        },
      });
    },
    onSuccess: () => {
      message.success("Saved successfully!");
      queryClient.invalidateQueries({
        queryKey: ["library", type, (session?.user as { id?: string })?.id],
      });
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          "x-user-id": (session?.user as { id?: string })?.id,
        },
      }),
    onSuccess: () => {
      message.success("Deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["library", type, (session?.user as { id?: string })?.id],
      });
    },
  });

  const handleOpenModal = (item?: ILibraryItem) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  return (
    <Flex vertical gap="middle">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleOpenModal()}
        style={{ alignSelf: "flex-start" }}
      >
        Add {type === "voice" ? "Voice" : "Template"}
      </Button>

      {items.length === 0 && !isLoading ? (
        <Empty description={`No ${type}s found`} />
      ) : (
        <Flex vertical gap="small">
          {items.map((item) => (
            <Card
              key={item._id}
              title={item.name}
              variant="borderless"
              style={{ background: "#1a1a1a" }}
              extra={
                <Space orientation="horizontal">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleOpenModal(item)}
                  />
                  <Popconfirm
                    title="Are you sure you want to delete this?"
                    onConfirm={() =>
                      item._id && deleteMutation.mutate(item._id)
                    }
                  >
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              }
            >
              {type === "voice" ? (
                <Flex vertical gap="small">
                  <Text type="secondary" copyable>
                    ID: {item.content}
                  </Text>
                  <Space>
                    <Tag color="blue">{item.service || "11labs"}</Tag>
                    <Tag color="green">
                      {item.language?.toUpperCase() || "EN"}
                    </Tag>
                  </Space>
                </Flex>
              ) : (
                <div style={{ color: "#8c8c8c", whiteSpace: "pre-wrap" }}>
                  {item.content}
                </div>
              )}
            </Card>
          ))}
        </Flex>
      )}

      <Modal
        title={editingItem ? "Edit" : "Add New"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={saveMutation.isPending}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => saveMutation.mutate(v)}
        >
          <Form.Item
            name="name"
            label={type === "voice" ? "Voice Name" : "Template Name"}
            rules={[{ required: true }]}
          >
            <Input
              placeholder={
                type === "voice" ? "e.g. Adam (Deep)" : "e.g. Sci-Fi Story"
              }
            />
          </Form.Item>

          <Form.Item
            name="content"
            label={type === "voice" ? "Voice ID" : "Prompt Content"}
            rules={[{ required: true }]}
          >
            {type === "voice" ? (
              <Input placeholder="Paste ElevenLabs Voice ID here..." />
            ) : (
              <TextArea rows={6} placeholder="Enter your prompt text..." />
            )}
          </Form.Item>

          {type === "voice" && (
            <Flex gap="middle">
              <Form.Item
                name="service"
                label="Service"
                initialValue="11labs"
                style={{ flex: 1 }}
              >
                <Select options={[{ value: "11labs", label: "11Labs" }]} />
              </Form.Item>
              <Form.Item
                name="language"
                label="Language"
                initialValue="en"
                style={{ flex: 1 }}
              >
                <Select
                  options={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Spanish" },
                    { value: "fr", label: "France" },
                  ]}
                />
              </Form.Item>
            </Flex>
          )}
        </Form>
      </Modal>
    </Flex>
  );
};

export default function LibraryManager() {
  const tabItems = [
    {
      key: "voice",
      label: (
        <span>
          <AudioOutlined /> Voices
        </span>
      ),
      children: <PromptManager type="voice" />,
    },
    {
      key: "story",
      label: (
        <span>
          <FileTextOutlined /> Story Prompts
        </span>
      ),
      children: <PromptManager type="story" />,
    }
  ];

  return (
    <div>
      <Title level={2}>
        <FileTextOutlined /> Library Manager
      </Title>
      <Tabs defaultActiveKey="voice" items={tabItems} />
    </div>
  );
}
