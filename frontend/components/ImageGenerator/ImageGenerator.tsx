"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Input,
  Select,
  Button,
  Progress,
  Modal,
  Space,
  Typography,
  Popconfirm,
} from "antd";
import {
  DownloadOutlined,
  DeleteOutlined,
  SyncOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useImageGenerator } from "../../hooks/useImageGenerator";
import { ImageCard } from "./ImageCard";
import { ImageTask } from "../../lib/imageStorage";
import styles from "./ImageGenerator.module.css";

const { Title, Text } = Typography;

export const ImageGenerator: React.FC = () => {
  const {
    tasks,
    isGeneratingPrompts,
    isProcessingQueue,
    progress,
    doneCount,
    generatePrompts,
    regenerateTask,
    clearAll,
  } = useImageGenerator();

  const [idea, setIdea] = useState("");
  const [promptsCount, setPromptsCount] = useState(2);
  const [photosPerPrompt, setPhotosPerPrompt] = useState(4);
  const [selectedTask, setSelectedTask] = useState<ImageTask | null>(null);

  const handleGenerate = () => {
    if (!idea) return;
    generatePrompts(idea, promptsCount, photosPerPrompt);
  };

  const handleDownloadZip = async () => {
    const doneTasks = tasks.filter((t) => t.status === "done" && t.imageBase64);
    if (doneTasks.length === 0) return;

    const zip = new JSZip();

    doneTasks.forEach((task, index) => {
      // Видаляємо заборонені символи з назви
      const safeTitle = task.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const fileName = `${index + 1}_${safeTitle}.jpg`;

      // Додаємо base64 в архів
      zip.file(fileName, task.imageBase64!, { base64: true });
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "footages.zip");
    } catch (err) {
      console.error("Error creating ZIP:", err);
      alert("Failed to create ZIP archive.");
    }
  };

  const downloadSingle = (task: ImageTask) => {
    if (!task.blobUrl) return;
    saveAs(task.blobUrl, `${task.title.replace(/[^a-z0-9]/gi, "_")}.jpg`);
  };

  const isAllDone =
    tasks.length > 0 &&
    tasks.every((t) => t.status === "done" || t.status === "error");

  return (
    <div className={styles.container}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2} style={{ margin: 0 }}>
          Генератор Футажів
        </Title>

        <Space wrap style={{ width: "100%", alignItems: "flex-end" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              minWidth: "300px",
            }}
          >
            <Text type="secondary">Ідея для футажів:</Text>
            <Input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Введіть ідею (наприклад: Кіберпанк місто вночі)"
              disabled={isGeneratingPrompts || isProcessingQueue}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text type="secondary">Промптів:</Text>
            <Select
              value={promptsCount}
              onChange={setPromptsCount}
              disabled={isGeneratingPrompts || isProcessingQueue}
              style={{ width: 100 }}
              options={[1, 2, 3, 4, 5].map((num) => ({
                value: num,
                label: num,
              }))}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text type="secondary">Фото на промпт:</Text>
            <Select
              value={photosPerPrompt}
              onChange={setPhotosPerPrompt}
              disabled={isGeneratingPrompts || isProcessingQueue}
              style={{ width: 140 }}
              options={[1, 2, 3, 4].map((num) => ({ value: num, label: num }))}
            />
          </div>

          <Button
            type="primary"
            icon={<SyncOutlined spin={isGeneratingPrompts} />}
            onClick={handleGenerate}
            disabled={isGeneratingPrompts || isProcessingQueue || !idea}
            loading={isGeneratingPrompts}
          >
            Згенерувати
          </Button>

          {tasks.length > 0 && (
            <Popconfirm
              title="Очистити все?"
              description="Ви впевнені, що хочете видалити всі згенеровані фото?"
              onConfirm={clearAll}
              okText="Так"
              cancelText="Ні"
              disabled={isGeneratingPrompts || isProcessingQueue}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={isGeneratingPrompts || isProcessingQueue}
              >
                Очистити
              </Button>
            </Popconfirm>
          )}

          {isAllDone && doneCount > 0 && (
            <Button
              type="primary"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              icon={<DownloadOutlined />}
              onClick={handleDownloadZip}
            >
              Скачати ZIP
            </Button>
          )}
        </Space>

        {tasks.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>
              {doneCount} / {tasks.length} футажів готово
              {(isGeneratingPrompts || isProcessingQueue) &&
                " (Процес триває...)"}
            </Text>
            <Progress
              percent={progress}
              status={progress === 100 ? "success" : "active"}
              strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
            />
          </div>
        )}

        <div className={styles.grid}>
          {tasks.map((task) => (
            <ImageCard
              key={task.id}
              task={task}
              onRegenerate={regenerateTask}
              onClick={setSelectedTask}
            />
          ))}
        </div>
      </Space>

      <Modal
        title={selectedTask?.title || "Деталі"}
        open={!!selectedTask}
        onCancel={() => setSelectedTask(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedTask(null)}>
            Закрити
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedTask && downloadSingle(selectedTask)}
          >
            Скачати фото
          </Button>,
        ]}
        width={800}
        centered
      >
        {selectedTask && selectedTask.blobUrl && (
          <Space orientation="vertical" style={{ width: "100%" }}>
            <img
              src={selectedTask.blobUrl}
              alt={selectedTask.title}
              style={{
                width: "100%",
                maxHeight: "60vh",
                objectFit: "contain",
                backgroundColor: "#000",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "12px",
                borderRadius: "8px",
                fontFamily: "monospace",
                color: "inherit", // успадковуємо колір тексту від Ant Design Theme
              }}
            >
              <strong>Prompt:</strong> {selectedTask.prompt}
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};
