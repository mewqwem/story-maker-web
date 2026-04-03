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
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1k");
  const [selectedTask, setSelectedTask] = useState<ImageTask | null>(null);

  const handleGenerate = () => {
    if (!idea) return;
    // Pass settings to the generatePrompts if we modify it, but for now we need to update the hook to receive them.
    generatePrompts(
      idea,
      promptsCount,
      photosPerPrompt,
      aspectRatio,
      resolution,
    );
  };

  const handleDownloadZip = async () => {
    const doneTasks = tasks.filter((t) => t.status === "done" && t.imageBase64);
    if (doneTasks.length === 0) return;

    const zip = new JSZip();

    doneTasks.forEach((task, index) => {
      // Remove invalid characters from the title
      const safeTitle = task.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const fileName = `${index + 1}_${safeTitle}.jpg`;

      // Add base64 to archive
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
          Footage Generator
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
            <Text type="secondary">Footage Idea:</Text>
            <Input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Enter your idea (e.g. Cyberpunk city at night)"
              disabled={isGeneratingPrompts || isProcessingQueue}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text type="secondary">Prompts:</Text>
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
            <Text type="secondary">Images per Prompt:</Text>
            <Select
              value={photosPerPrompt}
              onChange={setPhotosPerPrompt}
              disabled={isGeneratingPrompts || isProcessingQueue}
              style={{ width: 140 }}
              options={[1, 2, 3, 4].map((num) => ({ value: num, label: num }))}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text type="secondary">Aspect Ratio:</Text>
            <Select
              value={aspectRatio}
              onChange={setAspectRatio}
              disabled={isGeneratingPrompts || isProcessingQueue}
              style={{ width: 140 }}
              options={[
                { value: "1:1", label: "1:1 (Square)" },
                { value: "16:9", label: "16:9 (Landscape)" },
                { value: "9:16", label: "9:16 (Portrait)" },
                { value: "4:3", label: "4:3" },
                { value: "3:4", label: "3:4" },
              ]}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text type="secondary">Resolution:</Text>
            <Select
              value={resolution}
              onChange={setResolution}
              disabled={isGeneratingPrompts || isProcessingQueue}
              style={{ width: 140 }}
              options={[
                { value: "1k", label: "1K (Standard)" },
                { value: "2k", label: "2K (High)" },
                { value: "3k", label: "3K (Very High)" },
                { value: "4k", label: "4K (Ultra)" },
              ]}
            />
          </div>

          <Button
            type="primary"
            icon={<SyncOutlined spin={isGeneratingPrompts} />}
            onClick={handleGenerate}
            disabled={isGeneratingPrompts || isProcessingQueue || !idea}
            loading={isGeneratingPrompts}
          >
            Generate
          </Button>

          {tasks.length > 0 && (
            <Popconfirm
              title="Clear all?"
              description="Are you sure you want to delete all generated images?"
              onConfirm={clearAll}
              okText="Yes"
              cancelText="No"
              disabled={isGeneratingPrompts || isProcessingQueue}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={isGeneratingPrompts || isProcessingQueue}
              >
                Clear
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
              Download ZIP
            </Button>
          )}
        </Space>

        {tasks.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>
              {doneCount} / {tasks.length} footages ready
              {(isGeneratingPrompts || isProcessingQueue) && " (Processing...)"}
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
        title={selectedTask?.title || "Details"}
        open={!!selectedTask}
        onCancel={() => setSelectedTask(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedTask(null)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedTask && downloadSingle(selectedTask)}
          >
            Download Image
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
                color: "inherit",
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
