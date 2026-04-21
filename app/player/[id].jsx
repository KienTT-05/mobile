import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { studentApi } from '@/api/courseApi';
import { Button } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

export default function PlayerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [access, setAccess] = useState('trial');
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { void fetchContent(); }, [id]);

  const fetchContent = async () => {
    try {
      const res = await studentApi.getCourseContent(id);
      const c = res.data.data;
      setCourse(c);
      setAccess(res.data.access);
      setCompleted(res.data.completedLessons ?? []);
      const first = c.courseData?.[0]?.items?.[0];
      if (first) setActiveLesson(first);
    } catch {
      Alert.alert('Lỗi', 'Không tải được nội dung');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const selectLesson = (lesson) => {
    if (lesson.isLocked) {
      Alert.alert('Bài học bị khoá', 'Mua khoá học để truy cập');
      return;
    }
    setActiveLesson(lesson);
    setSidebarOpen(false);
  };

  const markComplete = async () => {
    if (!activeLesson || access !== 'full') return;
    try {
      const res = await studentApi.updateProgress(id, activeLesson.id);
      setCompleted(res.data.completedLessons);
    } catch { /* ignore */ }
  };

  const goNext = () => {
    const units = course?.courseData ?? [];
    let found = false;
    for (const unit of units) {
      for (const item of unit.items ?? []) {
        if (found && !item.isLocked) { setActiveLesson(item); return; }
        if (item.id === activeLesson?.id) found = true;
      }
    }
  };

  const isDone = (lessonId) => completed.includes(lessonId);

  const units = course?.courseData ?? [];
  const total = units.flatMap((u) => u.items ?? []).length;
  const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video */}
      <View style={styles.videoWrap}>
        {activeLesson?.type === 'video' && activeLesson.url ? (
          <Video
            ref={videoRef}
            source={{ uri: activeLesson.url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            onPlaybackStatusUpdate={(s) => { if (s.isLoaded && s.didJustFinish) void markComplete(); }}
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons
              name={activeLesson?.type === 'quiz' ? 'help-circle-outline' : 'document-text-outline'}
              size={56}
              color={COLORS.textMuted}
            />
            <Text style={styles.placeholderText}>{activeLesson?.title ?? 'Chọn bài học'}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backBtnInner}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Toggle bar */}
      <TouchableOpacity
        style={styles.toggleBar}
        onPress={() => setSidebarOpen(!sidebarOpen)}
        activeOpacity={0.8}
      >
        <Ionicons name="list" size={18} color="#fff" />
        <Text style={styles.toggleText}>
          {sidebarOpen ? 'Ẩn danh sách bài' : 'Danh sách bài học'}
        </Text>
        <Text style={styles.progressLabel}>{progress}% hoàn thành</Text>
      </TouchableOpacity>

      {sidebarOpen ? (
        /* Curriculum list */
        <ScrollView style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.courseTitle} numberOfLines={1}>{course?.title}</Text>
          </View>
          {units.map((unit, uIdx) => (
            <View key={uIdx}>
              <View style={styles.unitHeader}>
                <Text style={styles.unitTitle}>{unit.title ?? `Chương ${uIdx + 1}`}</Text>
              </View>
              {(unit.items ?? []).map((item, iIdx) => {
                const isActive = activeLesson?.id === item.id;
                const done = isDone(item.id);
                return (
                  <TouchableOpacity
                    key={iIdx}
                    style={[styles.lessonRow, isActive && styles.lessonRowActive]}
                    onPress={() => selectLesson(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.lessonIcon}>
                      {done ? (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                      ) : item.isLocked ? (
                        <Ionicons name="lock-closed" size={17} color={COLORS.textMuted} />
                      ) : (
                        <Ionicons
                          name={item.type === 'video' ? 'play-circle-outline' : item.type === 'quiz' ? 'help-circle-outline' : 'document-text-outline'}
                          size={20}
                          color={isActive ? COLORS.primary : COLORS.textSecondary}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.lessonTitle,
                        isActive && styles.lessonTitleActive,
                        item.isLocked && styles.lessonTitleLocked,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {item.isPreview && !item.isLocked && (
                      <Text style={styles.previewTag}>Thử</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      ) : (
        /* Lesson content */
        <ScrollView style={styles.lessonContent}>
          <Text style={styles.activeLessonTitle}>{activeLesson?.title}</Text>
          {activeLesson?.description && (
            <Text style={styles.activeLessonDesc}>{activeLesson.description}</Text>
          )}
          {activeLesson?.content && (
            <Text style={styles.activeLessonContent}>{activeLesson.content}</Text>
          )}
          <View style={{ marginTop: SPACING.lg, gap: SPACING.sm }}>
            {access === 'full' && (
              <Button
                title={isDone(activeLesson?.id ?? '') ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                onPress={() => void markComplete()}
                variant={isDone(activeLesson?.id ?? '') ? 'outline' : 'primary'}
                disabled={isDone(activeLesson?.id ?? '')}
                icon={isDone(activeLesson?.id ?? '') ? 'checkmark-circle' : 'checkmark-circle-outline'}
              />
            )}
            <Button title="Bài tiếp theo →" onPress={goNext} variant="outline" />
          </View>
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  videoWrap: { height: 220, backgroundColor: '#000', position: 'relative' },
  video: { width: '100%', height: '100%' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  placeholderText: { color: COLORS.textSecondary, fontSize: 13 },
  backBtn: { position: 'absolute', top: 12, left: SPACING.md },
  backBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  progressBg: { height: 3, backgroundColor: COLORS.surfaceLight },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  toggleBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: 10,
  },
  toggleText: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '600' },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  sidebar: { flex: 1 },
  sidebarHeader: {
    padding: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  courseTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  unitHeader: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
  },
  unitTitle: {
    color: COLORS.textSecondary, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border + '40',
  },
  lessonRowActive: { backgroundColor: COLORS.primary + '18' },
  lessonIcon: { width: 24, alignItems: 'center' },
  lessonTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 13 },
  lessonTitleActive: { color: COLORS.primary, fontWeight: '600' },
  lessonTitleLocked: { color: COLORS.textMuted },
  previewTag: {
    color: COLORS.primary, fontSize: 10, fontWeight: '700',
    backgroundColor: COLORS.primary + '22',
    borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2,
  },
  lessonContent: { flex: 1, padding: SPACING.lg },
  activeLessonTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: SPACING.sm },
  activeLessonDesc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: SPACING.md },
  activeLessonContent: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
});
