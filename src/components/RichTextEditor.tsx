import { TextField } from '@mui/material';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  className 
}: RichTextEditorProps) {
  return (
    <TextField
      fullWidth
      multiline
      minRows={6}
      maxRows={12}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      variant="outlined"
      className={className}
      sx={{
        '& .MuiOutlinedInput-root': {
          padding: 2,
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },
      }}
    />
  );
}