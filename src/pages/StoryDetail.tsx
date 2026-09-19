import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { STORIES_URL } from "@/config/api";
import { Story, categoryColors, timeAgo, CATEGORIES } from "@/lib/storyHelpers";
import { getOwnerToken } from "@/lib/ownerToken";

interface Comment {
  id: number;
  text: string;
  created_at: string;
}

export default function StoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reportedStory, setReportedStory] = useState(false);
  const [reportedComments, setReportedComments] = useState<number[]>([]);
  const [editing, setEditing] = useState(false);
  const [editCategory, setEditCategory] = useState("");
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const ownerToken = getOwnerToken();
    const [storyRes, commentsRes] = await Promise.all([
      fetch(`${STORIES_URL}?id=${id}&owner_token=${ownerToken}`),
      fetch(`${STORIES_URL}?id=${id}&action=comments`),
    ]);
    if (storyRes.status === 404) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const storyData = await storyRes.json();
    const commentsData = await commentsRes.json();
    setStory(storyData.story);
    setComments(commentsData.comments);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLike = async () => {
    if (liked || !story) return;
    setLiked(true);
    setStory({ ...story, reactions: story.reactions + 1 });
    await fetch(`${STORIES_URL}?id=${id}&action=react`, { method: "POST" });
  };

  const handleReportStory = async () => {
    if (reportedStory) return;
    setReportedStory(true);
    await fetch(`${STORIES_URL}?id=${id}&action=report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    toast({ title: "Жалоба отправлена", description: "Мы рассмотрим историю в ближайшее время." });
  };

  const handleReportComment = async (commentId: number) => {
    if (reportedComments.includes(commentId)) return;
    setReportedComments(prev => [...prev, commentId]);
    await fetch(`${STORIES_URL}?id=${id}&action=report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_id: commentId }),
    });
    toast({ title: "Жалоба отправлена", description: "Мы рассмотрим комментарий в ближайшее время." });
  };

  const startEditing = () => {
    if (!story) return;
    setEditCategory(story.category);
    setEditText(story.text);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!story || !editCategory || !editText.trim()) return;
    setSaving(true);
    const res = await fetch(`${STORIES_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: editCategory,
        text: editText.trim(),
        owner_token: getOwnerToken(),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setStory({ ...story, category: editCategory, text: editText.trim() });
      setEditing(false);
      toast({ title: "История обновлена" });
    } else {
      toast({ title: "Не удалось сохранить изменения", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`${STORIES_URL}?id=${id}&owner_token=${getOwnerToken()}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteOpen(false);
    if (res.ok) {
      toast({ title: "История удалена" });
      navigate("/stories");
    } else {
      toast({ title: "Не удалось удалить историю", variant: "destructive" });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    const res = await fetch(`${STORIES_URL}?id=${id}&action=comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText.trim() }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setComments(prev => [...prev, { id: data.id, text: commentText.trim(), created_at: data.created_at }]);
      setCommentText("");
      if (story) setStory({ ...story, comments_count: story.comments_count + 1 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Загружаем историю...</p>
      </div>
    );
  }

  if (notFound || !story) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-6 px-6">
        <p className="text-neutral-500">История не найдена</p>
        <button
          onClick={() => navigate("/stories")}
          className="bg-neutral-900 text-white px-8 py-3 uppercase text-sm tracking-widest hover:bg-neutral-700 transition-all duration-300 cursor-pointer"
        >
          Ко всем историям
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate("/stories")}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-700 transition-colors duration-200 mb-12 text-sm uppercase tracking-wide"
        >
          <Icon name="ArrowLeft" size={16} />
          Ко всем историям
        </button>

        <div className="flex justify-between items-center mb-6">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryColors[story.category] ?? "bg-neutral-100 text-neutral-600"}`}>
            {story.category}
          </span>
          <span className="text-xs text-neutral-400">{timeAgo(story.created_at)}</span>
        </div>

        {editing ? (
          <div className="mb-10 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEditCategory(cat)}
                  className={`px-4 py-2 text-sm border transition-all duration-200 cursor-pointer ${
                    editCategory === cat
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              maxLength={1000}
              rows={8}
              className="w-full bg-white border border-neutral-200 p-4 text-neutral-800 resize-none focus:outline-none focus:border-neutral-500 transition-colors duration-200 text-sm leading-relaxed"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editCategory || !editText.trim()}
                className="bg-neutral-900 text-white px-6 py-3 uppercase text-sm tracking-widest hover:bg-neutral-700 transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {saving ? "Сохраняем..." : "Сохранить"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="border border-neutral-300 text-neutral-700 px-6 py-3 uppercase text-sm tracking-widest hover:bg-neutral-100 transition-all duration-300 cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <p className="text-neutral-800 text-lg leading-relaxed mb-10 whitespace-pre-line">
            {story.text}
          </p>
        )}

        {story.is_owner && !editing && (
          <div className="flex items-center gap-4 mb-10 -mt-6">
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200 cursor-pointer"
            >
              <Icon name="Pencil" size={14} />
              Редактировать
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-red-600 transition-colors duration-200 cursor-pointer"
            >
              <Icon name="Trash2" size={14} />
              Удалить
            </button>
          </div>
        )}

        <div className="flex items-center gap-6 pb-10 border-b border-neutral-200">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
              liked ? "text-rose-500" : "text-neutral-500 hover:text-rose-500 cursor-pointer"
            }`}
          >
            <span>{liked ? "❤️" : "♥"}</span>
            <span>{story.reactions} поддержали</span>
          </button>
          <span className="flex items-center gap-2 text-sm text-neutral-500">
            <span>💬</span>
            <span>{story.comments_count} комментариев</span>
          </span>
          <button
            onClick={handleReportStory}
            disabled={reportedStory}
            className={`ml-auto flex items-center gap-1.5 text-xs transition-colors duration-200 ${
              reportedStory ? "text-neutral-300" : "text-neutral-400 hover:text-red-500 cursor-pointer"
            }`}
          >
            <Icon name="Flag" size={14} />
            <span>{reportedStory ? "Жалоба отправлена" : "Пожаловаться"}</span>
          </button>
        </div>

        <div className="mt-10">
          <h3 className="text-sm uppercase tracking-wide text-neutral-500 mb-6">Комментарии</h3>

          <form onSubmit={handleComment} className="flex flex-col gap-3 mb-10">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Поддержи автора или поделись своим мнением..."
              className="w-full bg-white border border-neutral-200 p-4 text-neutral-800 placeholder-neutral-400 resize-none focus:outline-none focus:border-neutral-500 transition-colors duration-200 text-sm leading-relaxed"
            />
            <button
              type="submit"
              disabled={sending || !commentText.trim()}
              className="bg-neutral-900 text-white px-6 py-3 uppercase text-sm tracking-widest hover:bg-neutral-700 transition-all duration-300 cursor-pointer disabled:opacity-50 w-fit"
            >
              {sending ? "Отправляем..." : "Отправить"}
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-neutral-400 text-sm">Пока нет комментариев. Будь первым.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {comments.map((c) => (
                <div key={c.id} className="bg-white p-5">
                  <p className="text-neutral-700 text-sm leading-relaxed mb-2">{c.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{timeAgo(c.created_at)}</span>
                    <button
                      onClick={() => handleReportComment(c.id)}
                      disabled={reportedComments.includes(c.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                        reportedComments.includes(c.id) ? "text-neutral-300" : "text-neutral-400 hover:text-red-500 cursor-pointer"
                      }`}
                    >
                      <Icon name="Flag" size={12} />
                      <span>{reportedComments.includes(c.id) ? "Жалоба отправлена" : "Пожаловаться"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить историю?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. История и все комментарии к ней будут удалены навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Удаляем..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}