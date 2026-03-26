"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Typography,
  Select,
  Input,
  Button,
  Card,
  Space,
  Divider,
  Flex,
  App,
} from "antd";
import { RocketOutlined, EditOutlined, AudioOutlined } from "@ant-design/icons";

interface ILibraryItem {
  _id: string;
  name: string;
  content: string;
  type: string;
  language?: string;
}

interface IGeneratePayload {
  projectName: string;
  title: string;
  templateId: string;
  language: string;
}

interface IGenerateResponse {
  script: string;
  projectName: string;
  success: boolean;
}

const { Title, Text } = Typography;

export default function CreateStoryPage() {
  const { message } = App.useApp();

  const [formData, setFormData] = useState<IGeneratePayload>({
    projectName: "",
    title: "",
    templateId: "",
    language: "Ukrainian",
  });

  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");

  const { data: templates, isLoading: loadingTemplates } = useQuery<
    ILibraryItem[]
  >({
    queryKey: ["templates", "story"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/library?type=story`,
      );
      return res.data;
    },
  });

  const { data: voices } = useQuery<ILibraryItem[]>({
    queryKey: ["templates", "voice"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/library?type=voice`,
      );
      return res.data;
    },
  });

  const storyMutation = useMutation({
    mutationFn: async (payload: IGeneratePayload) => {
      const res = await axios.post<IGenerateResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/generate-story`,
        payload,
      );
      return res.data;
    },
    onSuccess: (data) => {
      message.success(`Project "${data.projectName}" text generated!`);
    },
    onError: () => {
      message.error("Text generation failed. Check server logs.");
    },
  });

  // 4. Мутація для створення та скачування аудіо (ZIP архів)
  const audioMutation = useMutation({
    mutationFn: async (payload: {
      text: string;
      voiceId: string;
      projectName: string;
    }) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/generate-audio-archive`,
        payload,
        { responseType: "blob" }, // КРИТИЧНО ВАЖЛИВО ДЛЯ ФАЙЛІВ
      );
      return res.data as Blob;
    },
    onSuccess: (blob: Blob) => {
      // Створюємо тимчасове посилання і програмно натискаємо на нього для скачування
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formData.projectName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Archive downloaded successfully!");
    },
    onError: () => {
      message.error("Audio generation failed. Check server logs.");
    },
  });

  const handleGenerateText = () => {
    if (!formData.projectName || !formData.title || !formData.templateId) {
      return message.warning("Please fill all fields for the story");
    }
    storyMutation.mutate(formData);
  };

  const handleMakeVoice = () => {
    if (!storyMutation.data?.script) return;
    audioMutation.mutate({
      text: storyMutation.data.script,
      voiceId: selectedVoiceId,
      projectName: formData.projectName,
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Title level={2}>
        <RocketOutlined /> Create New Project
      </Title>

      <Card variant="borderless" style={{ background: "#1a1a1a" }}>
        <Space orientation="vertical" size="large" style={{ display: "flex" }}>
          <Flex vertical gap="4px">
            <Text strong>Project ID</Text>
            <Input
              size="large"
              placeholder="e.g. My_Epic_Story"
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
            />
          </Flex>

          <Flex vertical gap="4px">
            <Text strong>Story Topic</Text>
            <Input
              size="large"
              prefix={<EditOutlined />}
              placeholder="What is the story about?"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </Flex>

          <Flex gap="middle">
            <div style={{ flex: 1 }}>
              <Text strong>Template</Text>
              <Select
                size="large"
                placeholder="Select a template"
                loading={loadingTemplates}
                style={{ width: "100%", marginTop: 8 }}
                onChange={(val) =>
                  setFormData({ ...formData, templateId: val })
                }
                options={templates?.map((t) => ({
                  label: t.name,
                  value: t._id,
                }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong>Language</Text>
              <Select
                size="large"
                defaultValue="Ukrainian"
                style={{ width: "100%", marginTop: 8 }}
                onChange={(val) => setFormData({ ...formData, language: val })}
                options={[
                  { value: "Ukrainian", label: "Ukrainian" },
                  { value: "English", label: "English" },
                  { value: "German", label: "German" },
                ]}
              />
            </div>
          </Flex>

          <Divider style={{ margin: "12px 0" }} />

          <Button
            type="primary"
            size="large"
            block
            loading={storyMutation.isPending}
            onClick={handleGenerateText}
          >
            Generate Script
          </Button>
        </Space>
      </Card>

      {/* Блок з результатом та озвучкою */}
      {storyMutation.data?.success && (
        <Card
          title="AI Result: Please review the text"
          style={{
            marginTop: 20,
            background: "#000",
            border: "1px solid #333",
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              color: "#ccc",
              padding: "10px",
              background: "#111",
              borderRadius: "8px",
            }}
          >
            {storyMutation.data.script}
          </pre>

          <Divider style={{ borderColor: "#333" }} />

          <Flex align="center" gap="middle">
            <Text strong>Select Voice:</Text>
            <Select
              style={{ width: 250 }}
              placeholder="Choose a voice from Library"
              onChange={setSelectedVoiceId}
              options={voices?.map((v) => ({
                label: `${v.name} (${v.language || "N/A"})`,
                value: v.content, // Тут лежить Voice ID
              }))}
            />

            <Button
              type="primary"
              icon={<AudioOutlined />}
              loading={audioMutation.isPending}
              disabled={!selectedVoiceId}
              onClick={handleMakeVoice}
            >
              Make Voice & Download ZIP
            </Button>
          </Flex>
        </Card>
      )}
    </div>
  );
}
