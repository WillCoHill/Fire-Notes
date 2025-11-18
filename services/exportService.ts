// services/exportService.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Note, NoteRow } from '../types/note';
import { Alert } from 'react-native';

// WORKING ON THIS
// FUNCTIONS TEMPORARILY DISABLED AS OF 11/14/2025

export class ExportService {
  /**
   * EXPORT NOTE AS PLAINTEXT
   */
  static async exportNoteAsTxt(note: Note): Promise<void> {
    try {
      // Generate the text content from the note
      const textContent = this.generateTextContent(note);
      
      // CREATE FILENAME (REGEX invalid characters)
      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
      
      // Define the file path
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // WRITE FILE
      await FileSystem.writeAsStringAsync(filePath, textContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      console.log('File saved at:', filePath);
      
      // SEE IF SHARING IS AVAILABLE
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        // SHARE FUNCTION IF AVAIL
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: `Export: ${note.title}`,
          UTI: 'public.plain-text' // iOS uniform type identifier
        });
      } else {
        Alert.alert('Export Complete', `Note exported as: ${fileName}`);
      }
      
    } catch (error) {
      console.error('Error exporting note:', error);
      throw new Error('Failed to export note. Please try again.');
    }
  }

  /**
   * GENERATE PLAIN TEXT CONTENT FROM A NOTE
   */
  private static generateTextContent(note: Note): string {
    let content = `# ${note.title}\n\n`;
    content += `Created: ${new Date(note.createdAt).toLocaleString()}\n`;
    content += `Updated: ${new Date(note.updatedAt).toLocaleString()}\n\n`;
    content += '--- CONTENT ---\n\n';

    note.rows.forEach((row: NoteRow, index: number) => {
      // ROW NUM []
      content += `[${index + 1}] `;
      
      switch (row.type) {
        case 'text':
          content += `${row.content}\n\n`;
          break;
          
        case 'checkbox':
          const checkboxStatus = row.content === 'checked' ? '[✓]' : '[ ]';
          // EXTRACT TEXT PORTION
          const checkboxText = row.content === 'checked' || row.content === 'unchecked' 
            ? '' 
            : row.content;
          content += `${checkboxStatus} ${checkboxText}\n\n`;
          break;
          
        case 'bullet':
          content += `• ${row.content}\n\n`;
          break;
          
        case 'image':
          if (row.content) {
            const imageName = row.content.split('/').pop() || 'image';
            content += `[Image: ${imageName}]\n\n`;
          } else {
            content += `[Image: No image attached]\n\n`;
          }
          break;
          
        default:
          content += `[${row.type}: ${row.content}]\n\n`;
      }
    });

    content += `\n---\nExported from Fire Notes App on ${new Date().toLocaleString()}`;
    
    return content;
  }

  /**
   * Export a note as a MARKDOWN file
   */
  static async exportNoteAsMarkdown(note: Note): Promise<void> {
    try {
      const markdownContent = this.generateMarkdownContent(note);
      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.md`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, markdownContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      console.log('Markdown file saved at:', filePath);
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/markdown',
          dialogTitle: `Export: ${note.title} as Markdown`,
          UTI: 'net.daringfireball.markdown' // iOS UTI for Markdown
        });
      } else {
        Alert.alert('Export Complete', `Note exported as Markdown: ${fileName}`);
      }
      
    } catch (error) {
      console.error('Error exporting note as Markdown:', error);
      throw new Error('Failed to export note as Markdown. Please try again.');
    }
  }

  /**
   * CODE TO GENERATE THE MARKDOWN FROM NOTE
   */
  private static generateMarkdownContent(note: Note): string {
    let content = `# ${note.title}\n\n`;
    content += `**Created:** ${new Date(note.createdAt).toLocaleString()}  \n`;
    content += `**Updated:** ${new Date(note.updatedAt).toLocaleString()}  \n\n`;
    content += '---\n\n';

    note.rows.forEach((row: NoteRow, index: number) => {
      switch (row.type) {
        case 'text':
          // Preserve line breaks in text
          const textWithBreaks = row.content.replace(/\n/g, '  \n');
          content += `${textWithBreaks}\n\n`;
          break;
          
        case 'checkbox':
          const checkboxStatus = row.content === 'checked' ? '[x]' : '[ ]';
          const checkboxText = row.content === 'checked' || row.content === 'unchecked' 
            ? '' 
            : row.content;
          content += `- ${checkboxStatus} ${checkboxText}\n`;
          break;
          
        case 'bullet':
          content += `- ${row.content}\n`;
          break;
          
        case 'image':
          if (row.content) {
            // IMAGE LINK FOR MARKDOWN
            // NOTE: WILL ONLY WORK IF EXPORTED IMG IN SAME LOCATION
            const imageName = row.content.split('/').pop() || 'image';
            content += `![${imageName}](${row.content})\n\n`;
          } else {
            content += `*[Image not attached]*\n\n`;
          }
          break;
          
        default:
          content += `${row.content}\n\n`;
      }
    });

    content += `\n---\n*Exported from Fire Notes App on ${new Date().toLocaleString()}*`;
    
    return content;
  }

  /**
   * EEXPORT NOTE AS HTML FILE
   */
  static async exportNoteAsHtml(note: Note): Promise<void> {
    try {
      const htmlContent = this.generateHtmlContent(note);
      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.html`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      console.log('HTML file saved at:', filePath);
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/html',
          dialogTitle: `Export: ${note.title} as HTML`,
        });
      } else {
        Alert.alert('Export Complete', `Note exported as HTML: ${fileName}`);
      }
      
    } catch (error) {
      console.error('Error exporting note as HTML:', error);
      throw new Error('Failed to export note as HTML. Please try again.');
    }
  }

  /**
   * GENERATE HTML FROM NOTE
   */
  private static generateHtmlContent(note: Note): string {
    let content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(note.title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            background-color: #f8f9fa;
        }
        .note-header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .note-title {
            font-size: 2em;
            margin: 0 0 10px 0;
            color: #1a1a1a;
            border-bottom: 3px solid #007AFF;
            padding-bottom: 10px;
        }
        .note-meta {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        .note-content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .row {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .text-row {
            white-space: pre-wrap;
            font-size: 16px;
        }
        .checkbox-row {
            display: flex;
            align-items: flex-start;
        }
        .checkbox {
            margin-right: 10px;
            margin-top: 2px;
        }
        .bullet-row {
            display: flex;
        }
        .bullet {
            margin-right: 10px;
            font-weight: bold;
        }
        .image-row {
            text-align: center;
        }
        .image-placeholder {
            color: #999;
            font-style: italic;
            padding: 20px;
            background: #f8f8f8;
            border-radius: 8px;
        }
        .export-footer {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="note-header">
        <h1 class="note-title">${this.escapeHtml(note.title)}</h1>
        <div class="note-meta">
            <strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}<br>
            <strong>Updated:</strong> ${new Date(note.updatedAt).toLocaleString()}
        </div>
    </div>
    
    <div class="note-content">
`;

    note.rows.forEach((row: NoteRow, index: number) => {
      content += `        <div class="row ${row.type}-row">\n`;
      
      switch (row.type) {
        case 'text':
          content += `            <div class="text-row">${this.escapeHtml(row.content).replace(/\n/g, '<br>')}</div>\n`;
          break;
          
        case 'checkbox':
          const checked = row.content === 'checked';
          const checkboxText = row.content === 'checked' || row.content === 'unchecked' 
            ? '' 
            : this.escapeHtml(row.content);
          content += `            <div class="checkbox-row">\n`;
          content += `                <div class="checkbox">${checked ? '✅' : '⬜'}</div>\n`;
          content += `                <div class="checkbox-text">${checkboxText}</div>\n`;
          content += `            </div>\n`;
          break;
          
        case 'bullet':
          content += `            <div class="bullet-row">\n`;
          content += `                <div class="bullet">•</div>\n`;
          content += `                <div class="bullet-text">${this.escapeHtml(row.content)}</div>\n`;
          content += `            </div>\n`;
          break;
          
        case 'image':
          if (row.content) {
            content += `            <div class="image-row">\n`;
            content += `                <div class="image-placeholder">📷 Image: ${this.escapeHtml(row.content.split('/').pop() || 'Attached')}</div>\n`;
            content += `            </div>\n`;
          } else {
            content += `            <div class="image-row">\n`;
            content += `                <div class="image-placeholder">📷 No image attached</div>\n`;
            content += `            </div>\n`;
          }
          break;
          
        default:
          content += `            <div>${this.escapeHtml(row.content)}</div>\n`;
      }
      
      content += `        </div>\n`;
    });

    content += `    </div>
    
    <div class="export-footer">
        Exported from Notes App on ${new Date().toLocaleString()}
    </div>
</body>
</html>`;
    
    return content;
  }

  /**
   * NEED ESCAPES FOR HTML - #htmlescape #escapehtml
   */
  private static escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * MULTIPLE EXPORT FORMATS
   */
  static async exportNote(note: Note, format: 'txt' | 'md' | 'html' = 'txt'): Promise<void> {
    switch (format) {
      case 'txt':
        return this.exportNoteAsTxt(note);
      case 'md':
        return this.exportNoteAsMarkdown(note);
      case 'html':
        return this.exportNoteAsHtml(note);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * VIEW ALL CURRENTLY AVAILABLE EXPORT FORMATS
   */
  static getExportFormats(): Array<{ key: 'txt' | 'md' | 'html'; label: string; description: string }> {
    return [
      { key: 'txt', label: 'Text File', description: 'Plain text format' },
      { key: 'md', label: 'Markdown', description: 'Markdown format with formatting' },
      { key: 'html', label: 'HTML', description: 'Web page with styling' },
    ];
  }
}