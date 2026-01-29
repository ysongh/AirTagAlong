import { useState } from "react";
import { useTravelers } from "../hooks/useTravelers";

export function Travelers() {
  const {
    travelers,
    collectionId,
    isLoading,
    isCollectionLoading,
    isCollectionReady,
    isError,
    error,
    createTraveler,
    deleteTraveler,
    updateTraveler,
    isCreating,
    isDeleting,
    isUpdating,
    createError,
  } = useTravelers();

  const [newEventName, setNewEventName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTravelDate, setNewTravelDate] = useState("");
  const [editingTraveler, setEditingTraveler] = useState(null);
  const [editEventName, setEditEventName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTravelDate, setEditTravelDate] = useState("");

  const handleCreate = () => {
    if (!newEventName.trim() || !newTravelDate.trim() || !newContent.trim()) return;
    createTraveler(
      { event_name: newEventName, travel_date: newTravelDate, content: newContent },
      {
        onSuccess: () => {
          setNewEventName("");
          setNewTravelDate("");
          setNewContent("");
        },
      }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Delete this note?")) {
      deleteTraveler(id);
    }
  };

  const handleUpdate = () => {
    if (!editingTraveler || !editEventName.trim() || !editTravelDate.trim() || !editContent.trim()) return;
    updateTraveler(
      { id: editingTraveler._id, event_name: editEventName, travel_date: editTravelDate,  content: editContent },
      {
        onSuccess: () => {
          setEditingTraveler(null);
          setEditEventName("");
          setEditTravelDate("");
          setEditContent("");
        },
      }
    );
  };

  const startEdit = (traveler) => {
    setEditingTraveler(traveler);
    setEditEventName(traveler.event_name);
    setEditTravelDate(traveler.travel_date);
    setEditContent(traveler.content);
  };

  const cancelEdit = () => {
    setEditingTraveler(null);
    setEditEventName("");
    setEditTravelDate("");
    setEditContent("");
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
          Travelers (nilDB CRUD Demo)
        </h3>
        <div className="flex items-center gap-2">
          {isCollectionReady && collectionId && (
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
              Collection: {collectionId.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>

      {/* Collection Loading State */}
      {isCollectionLoading && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Setting up travelers collection...
            </p>
          </div>
        </div>
      )}

      {/* Create Traveler Form */}
      {isCollectionReady && (
        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            Create New Traveler
          </h4>
          <input
            type="text"
            placeholder="Event Name"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            className="w-full mb-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm"
          />
          <label className="flex items-center text-sm font-medium text-gray-700">
            Travel Date
          </label>
          <input
            type="date"
            value={newTravelDate}
            onChange={(e) => setNewTravelDate(e.target.value)}
            className="w-full mb-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm"
          />
          <div className="relative">
            <textarea
              placeholder="Content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              className="w-full mb-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm resize-none"
            />
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mb-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Content is encrypted (secret shared across 3 nodes)
            </span>
          </div>
          <button
            onClick={handleCreate}
            disabled={isCreating || !newEventName.trim() || !newTravelDate.trim() || !newContent.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isCreating ? "Creating..." : "Create Traveler"}
          </button>
          {createError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Error: {createError instanceof Error ? createError.message : "Failed to create traveler"}
            </p>
          )}
        </div>
      )}

      {/* Travelers List */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Your Travelers
        </h4>

        {isLoading && !isCollectionLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-xs text-zinc-500 mt-2">Loading travelers...</p>
          </div>
        )}

        {isError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : "Failed to load travelers"}
            </p>
          </div>
        )}

        {!isLoading && !isError && isCollectionReady && travelers.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
            No travelers yet. Create your first traveler above!
          </p>
        )}

        <div className="space-y-3">
          {travelers.map((traveler) => (
            <div
              key={traveler._id}
              className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              {editingTraveler?._id === traveler._id ? (
                <div>
                  <input
                    type="text"
                    placeholder="Event Name"
                    value={editEventName}
                    onChange={(e) => setEditEventName(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm"
                  />
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={editTravelDate}
                    onChange={(e) => setEditTravelDate(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm"
                  />
                  <textarea
                    placeholder="Content"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full mb-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white text-sm rounded-lg transition-colors"
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 bg-zinc-500 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-zinc-900 dark:text-white">
                      {traveler.event_name}
                    </h5>
                    <p>{traveler.travel_date}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(traveler)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(traveler._id)}
                        disabled={isDeleting}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                      {traveler.content}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                    Updated: {new Date(traveler.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
