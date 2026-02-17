# CreateQuery Component

A refactored, modular query creation form with voice recording and image upload capabilities.

## Structure

```
new-query/
├── CreateQuery.tsx          # Main orchestrator component
├── components/              # UI Components
│   ├── ImagePreview.tsx     # Image thumbnail grid
│   ├── VoiceNotePreview.tsx # Voice note player
│   ├── QueryInputToolbar.tsx # Bottom toolbar with buttons
│   ├── PrivacyToggle.tsx    # Privacy toggle button
│   └── index.ts             # Component exports
├── hooks/                   # Custom hooks
│   ├── useVoiceRecorder.ts  # Voice recording logic
│   ├── useImageUpload.ts    # Image upload logic
│   └── index.ts             # Hook exports
└── README.md                # This file
```

## Components

### CreateQuery (Main)

The main orchestrator component that:

- Manages form state with react-hook-form
- Coordinates between hooks and UI components
- Handles form submission with Supabase
- Manages validation
- Handles Ctrl+V paste for images
- Compresses images before upload

**Submission Flow:**

1. Validates user authentication
2. Creates query record in database
3. **Compresses images** (max 1920x1080, 80% quality, converts to JPEG)
4. Uploads voice note to Supabase Storage (if present)
5. Uploads compressed images to Supabase Storage (if present)
6. Creates attachment records for all files
7. Resets form and redirects on success

**Storage Structure:**

```
attachments/
└── queries/
    └── {classId}/
        └── {queryId}/
            ├── images/
            │   ├── image_0_{timestamp}.jpg
            │   └── image_1_{timestamp}.jpg
            └── voice/
                └── voice_{timestamp}.webm
```

### ImagePreview

Displays uploaded image thumbnails with:

- Hover effects (desktop)
- Always-visible delete buttons (mobile)
- Delete functionality with proper z-index
- Responsive grid layout

### VoiceNotePreview

Shows recorded voice note with:

- Play/pause controls
- Duration display
- Delete functionality

### QueryInputToolbar

Bottom toolbar that displays:

- Recording UI when recording is active
- Image and voice buttons when idle
- Auto-switches between states

### PrivacyToggle

Simple toggle button for:

- Switching between private/public modes
- Visual feedback with icons and colors

## Hooks

### useVoiceRecorder

Manages all voice recording functionality:

- MediaRecorder API integration
- **Audio compression**: Opus codec at 24kbps (~75% size reduction)
- Recording timer (max 2 minutes)
- Audio playback controls with countdown
- Playback progress tracking
- Automatic replay from beginning when ended
- Resource cleanup
- Auto-stop at max duration

**Compression Details:**

- Codec: Opus (optimized for speech)
- Bitrate: 24 kbps (vs ~128 kbps default)
- Typical 2-min recording: ~350 KB (vs ~1.5 MB uncompressed)
- Quality: Excellent for voice, minimal loss
- Fallback: Uses default settings if browser doesn't support compression

**Returns:**

```typescript
{
  isRecording: boolean
  recordingDuration: number
  audioBlob: Blob | null
  isPlaying: boolean
  hasVoiceNote: boolean
  currentPlaybackTime: number
  displayTime: number  // Shows countdown during playback, total duration otherwise
  startRecording: () => Promise<void>
  stopRecording: () => void
  deleteVoiceNote: () => void
  togglePlayback: () => void
  formatTime: (seconds: number) => string
}
```

### useImageUpload

Handles image selection and management:

- File input handling
- Validation (max 3 images)
- Toast notifications for limits
- Image removal

**Returns:**

```typescript
{
  fileInputRef: RefObject<HTMLInputElement>
  handleImageSelect: (e: ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
  triggerFileInput: () => void
  maxImages: number
  canAddMore: boolean
}
```

## Features

- ✅ Voice recording with MediaRecorder API
- ✅ Image upload with preview
- ✅ **Ctrl+V paste support for images**
- ✅ Privacy toggle (public/private)
- ✅ Form validation with zod
- ✅ Toast notifications for limits
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Contextual placeholders
- ✅ Clean separation of concerns

## Image Upload Methods

1. **Click the image button** in the toolbar
2. **Paste with Ctrl+V** while focused on the textarea
3. Images are automatically validated and limited to 3

## Usage

```tsx
import { CreateQuery } from "@/components/student/new-query/CreateQuery";

<CreateQuery classId="class-123" />;
```

## Limits

- **Images**: Maximum 3 images
- **Voice**: Maximum 2 minutes (120 seconds)
- **Description**: Maximum 1500 characters

All limits are enforced silently with toast notifications.
