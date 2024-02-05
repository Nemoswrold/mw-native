import type { VideoRef } from "react-native-video";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Video from "react-native-video";
import { useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayerWrapper() {
  const params = useLocalSearchParams();
  const videoUrl = typeof params.videoUrl === "string" ? params.videoUrl : "";
  return <VideoPlayer videoUrl={videoUrl} />;
}
interface VideoPlayerProps {
	videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
	const [isLoading, setIsLoading] = useState(true);
	const videoPlayer = useRef<VideoRef>(null);

	useEffect(() => {
		const lockOrientation = async () => {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.LANDSCAPE
			);
		};

		const unlockOrientation = async () => {
			await ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.PORTRAIT_UP
			);
		};

		const presentFullscreenPlayer = async () => {
			if (videoPlayer.current) {
				videoPlayer.current.presentFullscreenPlayer();
				await lockOrientation();
			}
		};

		const dismissFullscreenPlayer = async () => {
			if (videoPlayer.current) {
				videoPlayer.current.dismissFullscreenPlayer();
				await unlockOrientation();
			}
		};

		setIsLoading(true);
		void presentFullscreenPlayer();

		return () => {
			void dismissFullscreenPlayer();
		};
	}, [videoUrl]);

	const onVideoLoadStart = () => {
		setIsLoading(true);
	};

	const onReadyForDisplay = () => {
		setIsLoading(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Video
				ref={videoPlayer}
				source={{ uri: videoUrl }}
				style={styles.fullScreen}
				fullscreen={true}
				paused={false}
				controls={true}
				onLoadStart={onVideoLoadStart}
				onReadyForDisplay={onReadyForDisplay}
			/>
			{isLoading && <ActivityIndicator size="large" color="#0000ff" />}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});