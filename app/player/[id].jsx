import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { studentApi } from '@/api/courseApi';
import { Button } from '@/components/ui';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const extractYoutubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^?&\n]+)/,
    /youtube\.com\/v\/([^?&\n]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// ─── Native video (expo-video) ────────────────────────────────────────────────
function NativeVideoPlayer({ uri, onFinish }) {
  const player = useVideoPlayer(uri ? { uri } : null, (p) => { p.loop = false; });
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('playToEnd', () => onFinish?.());
    return () => sub.remove();
  }, [player]);
  if (!uri) return null;
  return (
    <VideoView
      player={player}
      style={styles.videoPlayer}
      contentFit="contain"
      nativeControls
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}

// ─── Quiz block ───────────────────────────────────────────────────────────────
function QuizBlock({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions?.length) return null;

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length
    : 0;

  return (
    <View style={styles.quizWrap}>
      <View style={styles.quizHeader}>
        <Ionicons name="help-circle" size={20} color={COLORS.primary} />
        <Text style={styles.quizTitle}>Bài kiểm tra</Text>
      </View>

      {questions.map((q, qi) => (
        <View key={qi} style={styles.questionWrap}>
          <Text style={styles.questionText}>{qi + 1}. {q.question}</Text>
          {(q.options ?? []).map((opt, oi) => {
            const selected = answers[qi] === oi;
            const correct  = q.correctAnswerIndex === oi;
            let bg = COLORS.surface;
            let border = COLORS.border;
            let textColor = COLORS.textPrimary;
            if (submitted) {
              if (correct)          { bg = COLORS.success + '22'; border = COLORS.success; textColor = COLORS.success; }
              else if (selected)    { bg = '#ff444422';            border = '#ff4444';      textColor = '#ff4444'; }
            } else if (selected) {
              bg = COLORS.primary + '22'; border = COLORS.primary; textColor = COLORS.primary;
            }
            return (
              <TouchableOpacity
                key={oi}
                style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                onPress={() => { if (!submitted) setAnswers({ ...answers, [qi]: oi }); }}
                activeOpacity={submitted ? 1 : 0.7}
              >
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {submitted && correct && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                )}
                {submitted && selected && !correct && (
                  <Ionicons name="close-circle" size={16} color="#ff4444" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {!submitted ? (
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => setSubmitted(true)}
        >
          <Text style={styles.submitText}>Nộp bài</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreText}>
            Kết quả: {score}/{questions.length} câu đúng
          </Text>
          <TouchableOpacity onPress={() => { setAnswers({}); setSubmitted(false); }}>
            <Text style={styles.retryText}>Làm lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Block renderer ───────────────────────────────────────────────────────────
function BlockRenderer({ block, onVideoEnd }) {
  if (!block) return null;

  switch (block.type) {
    case 'text':
    case 'paragraph':
      if (!block.content) return null;
      return <Text style={styles.blockText}>{block.content}</Text>;

    case 'heading':
      return <Text style={styles.blockHeading}>{block.content ?? ''}</Text>;

    case 'video': {
      // videoType: "link" → dùng youtubeUrl
      // videoType: "upload" → dùng uploadUrl
      const ytUrl  = block.youtubeUrl;
      const upUrl  = block.uploadUrl;
      const label  = block.youtubeTitle ?? block.uploadTitle ?? null;

      if (block.videoType === 'link' && ytUrl) {
        return (
          <View style={styles.blockVideoWrap}>
            {label && <Text style={styles.videoLabel}>{label}</Text>}
            <YoutubePlayer
              height={220}
              play={false}
              videoId={extractYoutubeId(ytUrl)}
              onChangeState={(e) => { if (e === 'ended') onVideoEnd?.(); }}
            />
          </View>
        );
      }
      if (block.videoType === 'upload' && upUrl) {
        return (
          <View style={styles.blockVideoWrap}>
            {label && <Text style={styles.videoLabel}>{label}</Text>}
            <NativeVideoPlayer uri={upUrl} onFinish={onVideoEnd} />
          </View>
        );
      }
      // Fallback nếu videoType không rõ
      if (ytUrl) {
        return (
          <View style={styles.blockVideoWrap}>
            <YoutubePlayer
              height={220}
              play={false}
              videoId={extractYoutubeId(ytUrl)}
              onChangeState={(e) => { if (e === 'ended') onVideoEnd?.(); }}
            />
          </View>
        );
      }
      if (upUrl) {
        return (
          <View style={styles.blockVideoWrap}>
            <NativeVideoPlayer uri={upUrl} onFinish={onVideoEnd} />
          </View>
        );
      }
      return null;
    }

    case 'image': {
      const src = block.url ?? block.src ?? block.imageUrl ?? null;
      if (!src) return null;
      return (
        <Image
          source={{ uri: src }}
          style={styles.blockImage}
          resizeMode="contain"
        />
      );
    }

    case 'quiz':
      return <QuizBlock questions={block.questions} />;

    default:
      if (block.content) return <Text style={styles.blockText}>{block.content}</Text>;
      return null;
  }
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PlayerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { top } = useSafeAreaInsets();
  const [course, setCourse]           = useState(null);
  const [access, setAccess]           = useState('trial');
  const [completed, setCompleted]     = useState([]);
  const [loading, setLoading]         = useState(true);
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
    } catch (e) {
      Alert.alert('Lỗi', 'Không tải được nội dung');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const selectLesson = (lesson) => {
    if (lesson.is_locked) {
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
        if (found && !item.is_locked) { setActiveLesson(item); return; }
        if (item.id === activeLesson?.id) found = true;
      }
    }
  };

  const isDone = (lessonId) => completed.includes(lessonId);

  const units    = course?.courseData ?? [];
  const total    = units.flatMap((u) => u.items ?? []).length;
  const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // blocks là object { lessonId: [...] } — tra cứu theo id bài đang học
  const blocks = activeLesson ? ((course?.blocks ?? {})[activeLesson.id] ?? []) : [];

  // Tìm video đầu tiên để hiển thị ở vùng player trên cùng
  const firstVideoBlock = blocks.find((b) => b.type === 'video');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Video area (luôn hiện ở trên) ── */}
      <View style={styles.videoWrap}>
        {firstVideoBlock ? (
          (() => {
            const b = firstVideoBlock;
            if ((b.videoType === 'link' || !b.videoType) && b.youtubeUrl) {
              return (
                <YoutubePlayer
                  height={220}
                  play={false}
                  videoId={extractYoutubeId(b.youtubeUrl)}
                  onChangeState={(e) => { if (e === 'ended') void markComplete(); }}
                />
              );
            }
            if ((b.videoType === 'upload' || !b.videoType) && b.uploadUrl) {
              return <NativeVideoPlayer uri={b.uploadUrl} onFinish={() => void markComplete()} />;
            }
            return null;
          })()
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
        <TouchableOpacity style={[styles.backBtn, { top: top + 8 }]} onPress={() => router.back()}>
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
        /* ── Curriculum list ── */
        <ScrollView style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.courseTitle} numberOfLines={1}>{course?.title}</Text>
          </View>
          {units.map((unit, uIdx) => (
            <View key={uIdx}>
              <View style={styles.unitHeader}>
                <Text style={styles.unitTitle}>
                  {unit.title ?? `Chương ${uIdx + 1}`}
                </Text>
              </View>
              {(unit.items ?? []).map((item, iIdx) => {
                const isActive = activeLesson?.id === item.id;
                const done     = isDone(item.id);
                const locked   = item.is_locked;
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
                      ) : locked ? (
                        <Ionicons name="lock-closed" size={17} color={COLORS.textMuted} />
                      ) : (
                        <Ionicons
                          name={
                            item.type === 'video' ? 'play-circle-outline'
                            : item.type === 'quiz' ? 'help-circle-outline'
                            : 'document-text-outline'
                          }
                          size={20}
                          color={isActive ? COLORS.primary : COLORS.textSecondary}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.lessonTitle,
                        isActive && styles.lessonTitleActive,
                        locked && styles.lessonTitleLocked,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {item.isPreview && !locked && (
                      <Text style={styles.previewTag}>Thử</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      ) : (
        /* ── Lesson content: render tất cả blocks ── */
        <ScrollView style={styles.lessonContent}>
          <Text style={styles.activeLessonTitle}>{activeLesson?.title}</Text>

          {blocks.length > 0 ? (
            blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                onVideoEnd={() => void markComplete()}
              />
            ))
          ) : (
            <Text style={styles.emptyBlocks}>Bài học này chưa có nội dung.</Text>
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
  container:          { flex: 1, backgroundColor: COLORS.background },
  center:             { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  // Video area
  videoWrap:          { height: 220, backgroundColor: '#000', position: 'relative' },
  videoPlayer:        { width: '100%', height: '100%' },
  videoPlaceholder:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  placeholderText:    { color: COLORS.textSecondary, fontSize: 13 },
  backBtn:            { position: 'absolute', left: SPACING.md },
  backBtnInner:       { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  // Progress
  progressBg:         { height: 3, backgroundColor: COLORS.surfaceLight },
  progressFill:       { height: '100%', backgroundColor: COLORS.primary },
  // Toggle
  toggleBar:          { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: 10 },
  toggleText:         { flex: 1, color: '#fff', fontSize: 13, fontWeight: '600' },
  progressLabel:      { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  // Sidebar
  sidebar:            { flex: 1 },
  sidebarHeader:      { padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  courseTitle:        { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  unitHeader:         { backgroundColor: COLORS.surfaceLight, paddingHorizontal: SPACING.md, paddingVertical: 8 },
  unitTitle:          { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  lessonRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: SPACING.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border + '40' },
  lessonRowActive:    { backgroundColor: COLORS.primary + '18' },
  lessonIcon:         { width: 24, alignItems: 'center' },
  lessonTitle:        { flex: 1, color: COLORS.textPrimary, fontSize: 13 },
  lessonTitleActive:  { color: COLORS.primary, fontWeight: '600' },
  lessonTitleLocked:  { color: COLORS.textMuted },
  previewTag:         { color: COLORS.primary, fontSize: 10, fontWeight: '700', backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2 },
  // Lesson content
  lessonContent:      { flex: 1, padding: SPACING.lg },
  activeLessonTitle:  { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: SPACING.md },
  emptyBlocks:        { color: COLORS.textMuted, fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: SPACING.xl },
  // Blocks
  blockText:          { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: SPACING.sm },
  blockHeading:       { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.md },
  blockVideoWrap:     { marginBottom: SPACING.md, borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: '#000' },
  videoLabel:         { color: COLORS.textSecondary, fontSize: 12, padding: 6, backgroundColor: '#111' },
  blockImage:         { width: '100%', height: 200, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  // Quiz
  quizWrap:           { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  quizHeader:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md },
  quizTitle:          { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  questionWrap:       { marginBottom: SPACING.md },
  questionText:       { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: SPACING.sm },
  optionBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 10, marginBottom: 6 },
  optionText:         { fontSize: 13, flex: 1 },
  submitBtn:          { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  submitText:         { color: '#fff', fontWeight: '700', fontSize: 14 },
  scoreWrap:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  scoreText:          { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  retryText:          { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
});