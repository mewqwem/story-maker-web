import React from "react";
import { Flex, Input, Select, Button, Typography, Space, Divider } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { IGeneratePayload } from "@/type/generate";
import { ILibraryItem } from "@/type/library";

const { Text } = Typography;

interface StoryFormProps {
  formData: IGeneratePayload;
  setFormData: (data: IGeneratePayload) => void;
  templates: ILibraryItem[] | undefined;
  loadingTemplates: boolean;
  onSubmit: () => void;
  isPending: boolean;
}

export const StoryForm: React.FC<StoryFormProps> = ({
  formData,
  setFormData,
  templates,
  loadingTemplates,
  onSubmit,
  isPending,
}) => {
  return (
    <Space orientation="vertical" size="large" style={{ display: "flex" }}>
      {/* Project Identification */}
      <Flex vertical gap="4px">
        <Text strong>Project ID</Text>
        <Input
          size="large"
          placeholder="e.g. My_Epic_Story"
          value={formData.projectName}
          onChange={(e) =>
            setFormData({ ...formData, projectName: e.target.value })
          }
        />
      </Flex>

      {/* Story Content Input */}
      <Flex vertical gap="4px">
        <Text strong>Story Topic</Text>
        <Input
          size="large"
          prefix={<EditOutlined />}
          placeholder="What is the story about?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </Flex>

      {/* Selectors Row */}
      <Flex gap="middle">
        <div style={{ flex: 1 }}>
          <Text strong>Template</Text>
          <Select
            size="large"
            placeholder="Select a template"
            loading={loadingTemplates}
            style={{ width: "100%", marginTop: 8 }}
            onChange={(val) => setFormData({ ...formData, templateId: val })}
            options={templates?.map((t) => ({ label: t.name, value: t._id }))}
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
              { value: "English", label: "English" },
              { value: "German", label: "German" },
              { value: "France", label: "France" },
            ]}
          />
        </div>
      </Flex>

      <Divider style={{ margin: "12px 0" }} />

      <Button
        type="primary"
        size="large"
        block
        loading={isPending}
        onClick={onSubmit}
      >
        Generate Script
      </Button>
    </Space>
  );
};
