"use client";

import React, { useEffect, useState } from "react";
import { Typography, Card, App } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react"; // 1. Import session hook
import { getLibrary, generateStory, generateAudioArchive } from "@/lib/api";
import { StoryForm } from "@/components/StoryForm/StoryForm";
import { StoryResult } from "@/components/StoryResult/StoryResult";
import { useStoryFormStore } from "@/store/storyFormStore";

const { Title } = Typography;

export default function CreateStoryPage() {
  const { message } = App.useApp();
  const { data: session } = useSession(); // 2. Get user session

  // Extract userId from session
  const userId = (session?.user as any)?.id;

  const formData = useStoryFormStore((state) => state.formData);
  const setFormData = useStoryFormStore((state) => state.setFormData);
  const selectedVoiceId = useStoryFormStore((state) => state.selectedVoiceId);
  const setSelectedVoiceId = useStoryFormStore(
    (state) => state.setSelectedVoiceId,
  );

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Update query key and function to include userId
  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ["templates", "story", userId], // Key changes when user logs in
    queryFn: () => getLibrary("story", userId), // Pass userId to the API helper
    enabled: !!userId, // Prevent request if userId is not loaded yet
  });

  const { data: voices } = useQuery({
    queryKey: ["templates", "voice", userId],
    queryFn: () => getLibrary("voice", userId),
    enabled: !!userId,
  });

  const storyMutation = useMutation({
    mutationFn: generateStory,
    onSuccess: (data) =>
      message.success(`Project "${data.projectName}" generated!`),
  });

  const audioMutation = useMutation({
    mutationFn: generateAudioArchive,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formData.projectName}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
  });

  if (!isMounted) return null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Title level={2}>
        <RocketOutlined /> Create New Project
      </Title>

      <Card variant="borderless" style={{ background: "#1a1a1a" }}>
        <StoryForm
          formData={formData}
          setFormData={setFormData}
          templates={templates}
          loadingTemplates={loadingTemplates}
          onSubmit={() => storyMutation.mutate(formData)}
          isPending={storyMutation.isPending}
        />
      </Card>

      {storyMutation.data?.success && (
        <StoryResult
          script={storyMutation.data.script}
          voices={voices}
          selectedVoiceId={selectedVoiceId}
          setSelectedVoiceId={setSelectedVoiceId}
          isAudioPending={audioMutation.isPending}
          onMakeVoice={() =>
            audioMutation.mutate({
              text: storyMutation.data!.script,
              voiceId: selectedVoiceId,
              projectName: formData.projectName,
            })
          }
        />
      )}
    </div>
  );
}
