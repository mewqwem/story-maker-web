"use client";

import React from "react";
import { saveAs } from "file-saver";
import {
  Input,
  Select,
  Button,
  Space,
  Typography,
  Card,
  Popconfirm,
  Alert,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SyncOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  useDetailedImageGenerator,
  DetailedImageTask,
} from "../../hooks/useDetailedImageGenerator";

const { Title, Text } = Typography;
const { TextArea } = Input;

export const DetailedImageGenerator: React.FC = () => {
  const {
    tasks,
    aspectRatio,
    resolution,
    setAspectRatio,
    setResolution,
    addTask,
    removeTask,
    updateTaskPrompt,
    generateSingleTask,
    clearAll,
  } = useDetailedImageGenerator();

  const downloadSingle = (task: DetailedImageTask) => {
    if (!task.blobUrl) return;
    const safeTitle =
      task.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "_") || "image";
    saveAs(task.blobUrl, `${safeTitle}.jpg`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2} style={{ margin: 0 }}>
          Image Generation
        </Title>

        <Card
          variant="borderless"
          style={{ background: "#1a1a1a", marginBottom: "1rem" }}
        >
          <Space wrap size="large" style={{ width: "100%" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <Text type="secondary">Aspect Ratio:</Text>
              <Select
                value={aspectRatio}
                onChange={setAspectRatio}
                style={{ width: 150 }}
                options={[
                  { value: "1:1", label: "1:1 (Square)" },
                  { value: "16:9", label: "16:9 (Landscape)" },
                  { value: "9:16", label: "9:16 (Portrait)" },
                  { value: "4:3", label: "4:3" },
                  { value: "3:4", label: "3:4" },
                ]}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <Text type="secondary">Resolution:</Text>
              <Select
                value={resolution}
                onChange={setResolution}
                style={{ width: 150 }}
                options={[
                  { value: "1k", label: "1K (Standard)" },
                  { value: "2k", label: "2K (High)" },
                  { value: "3k", label: "3K (Very High)" },
                  { value: "4k", label: "4K (Ultra)" },
                ]}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: "100%",
                paddingBottom: "2px",
              }}
            >
              <Popconfirm
                title="Clear all?"
                description="Are you sure you want to delete all tasks and generated images?"
                onConfirm={clearAll}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Clear All
                </Button>
              </Popconfirm>
            </div>
          </Space>
        </Card>

        {tasks.map((task, index) => (
          <Card
            key={task.id}
            variant="borderless"
            style={{
              background: "#1a1a1a",
              borderColor:
                task.status === "generating" ? "#1890ff" : "transparent",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong>Prompt #{index + 1}</Text>
                {tasks.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeTask(task.id)}
                    disabled={task.status === "generating"}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <TextArea
                rows={4}
                value={task.prompt}
                onChange={(e) => updateTaskPrompt(task.id, e.target.value)}
                placeholder="Enter a detailed prompt for this image..."
                disabled={task.status === "generating"}
                style={{ resize: "none" }}
              />

              <Button
                type="primary"
                icon={<SyncOutlined spin={task.status === "generating"} />}
                onClick={() => generateSingleTask(task.id)}
                disabled={task.status === "generating" || !task.prompt.trim()}
                loading={task.status === "generating"}
              >
                {task.status === "generating" ? "Generating..." : "Start"}
              </Button>

              {task.status === "error" && (
                <Alert
                  type="error"
                  message="Error"
                  description={task.errorMessage}
                  showIcon
                />
              )}

              {task.status === "done" && task.blobUrl && (
                <div
                  style={{
                    marginTop: "1rem",
                    position: "relative",
                    background: "#000",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={task.blobUrl}
                    alt={task.prompt}
                    style={{
                      width: "100%",
                      maxHeight: "600px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                  <div style={{ position: "absolute", bottom: 16, right: 16 }}>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => downloadSingle(task)}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </Space>
          </Card>
        ))}

        {tasks.length < 20 && (
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={addTask}
            style={{ height: "60px", borderColor: "#444", color: "#888" }}
          >
            Add New Prompt
          </Button>
        )}
      </Space>
    </div>
  );
};
