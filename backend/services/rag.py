from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from langchain_core.prompts import PromptTemplate
from config import settings
import asyncio
import logging

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self, embedding_service):
        print(f"🔑 GROQ API KEY: {'✅ Set' if settings.GROQ_API_KEY else '❌ Missing'}")
        print(f"🤖 MODEL: {settings.LLM_MODEL}")
        
        self.embedding_service = embedding_service

        try:
            # ✅ Groq LLM - use 'api_key' not 'groq_api_key'
            self.llm = ChatGroq(
                model=settings.LLM_MODEL,
                api_key=settings.GROQ_API_KEY,  # Changed from groq_api_key
                temperature=0.7,
                timeout=30,
                max_retries=2
            )
            print("✅ ChatGroq initialized successfully")
        except Exception as e:
            print(f"❌ ChatGroq initialization failed: {e}")
            raise e

        self.prompt = PromptTemplate(
            template="""Use the following context to answer the question.
If you cannot find the answer in the context, say so.

Context:
{context}

Question:
{question}

Answer:""",
            input_variables=["context", "question"]
        )

    async def query(self, question: str):
        try:
            print(f"\n🔍 Query received: {question}")
            
            # Search documents
            docs = await self.embedding_service.similarity_search(
                question, k=settings.TOP_K
            )

            if not docs:
                print("⚠️ No documents found")
                return {
                    "answer": "I don't have any documents to answer your question yet. Please upload some documents first.",
                    "sources": []
                }

            print(f"📚 Found {len(docs)} relevant documents")
            context = "\n\n".join(doc.page_content for doc in docs)

            formatted_prompt = self.prompt.format(
                context=context,
                question=question
            )

            print("🤖 Calling Groq API...")
            
            # Call Groq
            response = await asyncio.to_thread(
                self.llm.invoke, 
                [HumanMessage(content=formatted_prompt)]
            )

            answer = response.content if hasattr(response, "content") else str(response)
            
            sources = list({doc.metadata.get("source", "Unknown") for doc in docs})

            print(f"✅ Answer generated: {answer[:100]}...")
            
            return {
                "answer": answer,
                "sources": sources
            }
        
        except Exception as e:
            print(f"❌ Error in query: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e