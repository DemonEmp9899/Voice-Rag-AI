import React from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';

const DocumentList = ({ documents, onUpload, onDelete, isProcessing }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-400" />
        Documents
      </h2>
      
      <label className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg cursor-pointer transition-all shadow-lg hover:shadow-purple-500/50 mb-4">
        <Upload className="w-4 h-4" />
        <span className="font-medium">Upload Files</span>
        <input
          type="file"
          multiple
          accept=".pdf,.txt"
          onChange={onUpload}
          disabled={isProcessing}
          className="hidden"
        />
      </label>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {documents.map((doc, idx) => (
          <div 
            key={idx} 
            className="bg-white/5 hover:bg-white/10 rounded-lg p-3 flex items-center justify-between transition-all border border-white/10"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-sm text-white truncate" title={doc}>
                {doc}
              </span>
            </div>
            <button
              onClick={() => onDelete(doc)}
              className="text-red-400 hover:text-red-300 ml-2 transition-colors"
              title="Delete document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-lg">
          <FileText className="w-12 h-12 text-purple-400/50 mx-auto mb-2" />
          <p className="text-purple-300 text-sm">No documents uploaded yet</p>
          <p className="text-purple-400 text-xs mt-1">Upload PDF or TXT files</p>
        </div>
      )}
    </div>
  );
};

export default DocumentList;