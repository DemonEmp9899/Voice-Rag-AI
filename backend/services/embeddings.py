from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings  # ✅ New import
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from config import settings
import os


class EmbeddingService:
    def __init__(self):
        # ✅ FREE, LOCAL embeddings (NO API KEY, NO QUOTA)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        self.vectorstore = None

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )

        self._load_vectorstore()

    def _load_vectorstore(self):
        """Load existing vectorstore from disk (if available)"""
        vectorstore_path = settings.VECTORSTORE_DIR
        if os.path.exists(vectorstore_path):
            try:
                self.vectorstore = FAISS.load_local(
                    vectorstore_path,
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
            except Exception:
                self.vectorstore = None

    async def add_documents(self, file_paths: list):
        """Add documents to vector store"""
        all_docs = []

        for file_path in file_paths:
            if file_path.endswith(".pdf"):
                loader = PyPDFLoader(file_path)
            elif file_path.endswith(".txt"):
                loader = TextLoader(file_path)
            else:
                continue

            docs = loader.load()
            chunks = self.text_splitter.split_documents(docs)
            all_docs.extend(chunks)

        if not all_docs:
            raise ValueError(
                "No loadable documents found. Upload .pdf or .txt files with content."
            )

        # Create or update vectorstore
        if self.vectorstore is None:
            self.vectorstore = FAISS.from_documents(all_docs, self.embeddings)
        else:
            self.vectorstore.add_documents(all_docs)

        # Save vectorstore
        os.makedirs(settings.VECTORSTORE_DIR, exist_ok=True)
        self.vectorstore.save_local(settings.VECTORSTORE_DIR)

    async def similarity_search(self, query: str, k: int = 3):
        """Search for similar documents"""
        if self.vectorstore is None:
            return []
        return self.vectorstore.similarity_search(query, k=k)