import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Newspaper,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Globe,
  Shield,
  FileText,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { apiClient, ApiError, EducationalNewsResponse } from "@shared/api-client";

interface VerificationResult {
  prediction: string;
  confidence: number;
  message: string;
  demoMode: boolean;
  analysisDetails: any;
}

interface EducationalNewsArticle {
  title: string;
  url: string;
  image: string;
  description?: string;
}

interface EducationalNewsResponse {
  success: boolean;
  articles: EducationalNewsArticle[];
  count: number;
  error?: string;
}

export default function News() {
  const [newsText, setNewsText] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [educationalNews, setEducationalNews] = useState<EducationalNewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  // Hero carousel
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1200&h=600&fit=crop",
      title: "Latest News",
      description: "Stay updated with educational developments, policies, and opportunities.",
    },
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    intervalRef.current = setInterval(() => setHeroIndex((prev) => (prev + 1) % heroSlides.length), 5000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  const handlePrev = () => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const handleNext = () => setHeroIndex((prev) => (prev + 1) % heroSlides.length);

  // Fetch educational news from Django API
  const fetchEducationalNews = async () => {
    setIsLoadingNews(true);
    setNewsError(null);
    try {
      const newsResponse = await apiClient.getEducationalNewsWithMeta();
      
      if (newsResponse.articles && newsResponse.articles.length > 0) {
        setEducationalNews(newsResponse.articles);
        
        // Set error message only if using fallback data
        if (newsResponse.source === 'fallback') {
          setNewsError(newsResponse.message || "Showing sample educational news (API offline)");
        } else {
          setNewsError(null); // Clear error for live data
          console.log(`✅ Loaded ${newsResponse.articles.length} live educational news articles`);
        }
        
        // Update last refresh time
        setLastRefresh(new Date().toLocaleTimeString());
      } else {
        throw new Error("No articles found");
      }
    } catch (error) {
      console.error("News fetch error:", error);
      if (error instanceof ApiError) {
        setNewsError(`Showing sample educational news (${apiClient.getErrorMessage(error)})`);
      } else {
        setNewsError("Showing sample educational news (API offline)");
      }
      setEducationalNews(getFallbackEducationalNews());
    } finally {
      setIsLoadingNews(false);
    }
  };

  const getFallbackEducationalNews = (): EducationalNewsArticle[] => [
    {
      title: "New Education Policy 2024: Major Changes in Higher Education",
      url: "#",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=200&fit=crop",
    },
    {
      title: "NEET 2024 Results: Record Number of Students Qualify",
      url: "#",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop",
    },
    {
      title: "IIT Admissions 2024: New Courses and Seat Matrix",
      url: "#",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&h=200&fit=crop",
    },
    {
      title: "Digital Learning Revolution in Indian Schools",
      url: "#",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop",
    },
    {
      title: "Scholarship Programs for Underprivileged Students",
      url: "#",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
    },
    {
      title: "Career Opportunities in Emerging Technologies",
      url: "#",
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop",
    },
    {
      title: "International Exchange Programs for Indian Students",
      url: "#",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop",
    },
    {
      title: "Research Funding Initiatives in Indian Universities",
      url: "#",
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=200&fit=crop",
    },
  ];

  useEffect(() => {
    fetchEducationalNews();
  }, []);

  const handleVerifyNews = async () => {
    if (!newsText.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const result = await apiClient.detectFakeNews(newsText.trim());
      setVerificationResult({
        prediction: result.prediction,
        confidence: result.confidence,
        message: result.message,
        demoMode: result.demo_mode || false,
        analysisDetails: result.analysis_details,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setVerificationResult({ 
          prediction: "error", 
          confidence: 0, 
          message: apiClient.getErrorMessage(error), 
          demoMode: false, 
          analysisDetails: null 
        });
      } else {
        setVerificationResult({ 
          prediction: "error", 
          confidence: 0, 
          message: "Network error. Try again.", 
          demoMode: false, 
          analysisDetails: null 
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="pt-16" style={{ marginLeft: "var(--sidebar-width, 0px)" }}>
        {/* Hero Section */}
        <div className="relative">
          <Carousel>
            <CarouselContent>
              {heroSlides.map((slide, idx) => (
                <CarouselItem key={idx} style={{ display: idx === heroIndex ? "block" : "none" }}>
                  <section
                    className="relative py-24 bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${slide.image}')`,
                    }}
                  >
                    <div className="text-center text-white px-6">
                      <Newspaper className="h-6 w-6 mx-auto mb-3" />
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                      <p className="max-w-2xl mx-auto">{slide.description}</p>
                    </div>
                  </section>
                </CarouselItem>
              ))}
            </CarouselContent>
            <Button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2">
              <ArrowLeft />
            </Button>
            <Button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2">
              <ArrowRight />
            </Button>
          </Carousel>
        </div>

        {/* ✅ Educational News Grid */}
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-3xl font-bold">Latest Educational News</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated with top education news from verified sources.
            </p>
            <div className="flex flex-col items-start gap-2 mt-4">
              <Button onClick={fetchEducationalNews} disabled={isLoadingNews} variant="outline" size="sm">
                {isLoadingNews ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" /> 
                    Refresh News
                  </>
                )}
              </Button>
              {lastRefresh && !isLoadingNews && (
                <p className="text-xs text-gray-500">
                  Last updated: {lastRefresh}
                </p>
              )}
            </div>
          </div>

          {newsError && <p className="text-yellow-600 text-center mb-4">{newsError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(educationalNews.length > 0 ? educationalNews : getFallbackEducationalNews()).slice(0, 8).map((article, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.description || article.title}</p>
                    <Button variant="ghost" size="sm" onClick={() => window.open(article.url, "_blank")}>
                      Read Full Article <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 🚀 Enhanced Fake News Detector Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 rounded-3xl blur-3xl"></div>
            
            <Card className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Header with animated gradient */}
              <CardHeader className="text-center py-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative z-10"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                      <div className="relative flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                        <Shield className="h-10 w-10 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    AI News Verifier
                  </CardTitle>
                  <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                    Advanced BERT-powered detection system to identify fake news with confidence scores
                  </p>
                </motion.div>
              </CardHeader>
              
              <CardContent className="p-8 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Input Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Enter News Content
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Paste any news article or text content below for AI-powered verification
                      </p>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                      <div className="relative">
                        <FileText className="absolute top-4 left-4 h-6 w-6 text-blue-500 z-10" />
                        <Textarea
                          id="newsText"
                          placeholder="📰 Paste your news article or text content here...\n\nExample: 'Breaking: Government announces new education policy changes affecting millions of students across the country...'"
                          value={newsText}
                          onChange={(e) => setNewsText(e.target.value)}
                          className="min-h-[240px] pl-14 pr-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-300 resize-none"
                          maxLength={5000}
                        />
                        <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
                          {newsText.length}/5000
                        </div>
                      </div>
                    </div>
                    
                    {/* Character count and requirements */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        {newsText.length >= 50 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={newsText.length >= 50 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          Minimum 50 characters required
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">
                        {newsText.length < 50 ? `${50 - newsText.length} more needed` : "Ready to analyze"}
                      </span>
                    </div>
                  </motion.div>
                  
                  {/* Action Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <Button
                      onClick={handleVerifyNews}
                      disabled={isVerifying || newsText.trim().length < 50}
                      size="lg"
                      className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Search className="h-6 w-6 mr-3" />
                          Verify News Authenticity
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  {/* Results Section */}
                  {verificationResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="mt-12"
                    >
                      <div className={`relative p-8 rounded-3xl border-2 ${
                        verificationResult.prediction === "Real" 
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
                          : verificationResult.prediction === "Fake"
                          ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700"
                          : "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700"
                      }`}>
                        {/* Result Icon */}
                        <div className="text-center mb-6">
                          {verificationResult.prediction === "Real" ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            >
                              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                              </div>
                            </motion.div>
                          ) : verificationResult.prediction === "Fake" ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            >
                              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                              </div>
                            </motion.div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-900/30 rounded-full mb-4">
                              <XCircle className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Result Title */}
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className={`text-3xl md:text-4xl font-bold text-center mb-4 flex items-center justify-center gap-4 ${
                            verificationResult.prediction === "Real"
                              ? "text-green-800 dark:text-green-300"
                              : verificationResult.prediction === "Fake"
                              ? "text-red-800 dark:text-red-300"
                              : "text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {verificationResult.prediction === "Real" ? (
                            <>
                              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                              News Appears REAL
                            </>
                          ) : verificationResult.prediction === "Fake" ? (
                            <>
                              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                              News Appears FAKE
                            </>
                          ) : (
                            <>
                              <XCircle className="h-10 w-10 text-gray-600 dark:text-gray-400" />
                              Analysis Error
                            </>
                          )}
                        </motion.h3>
                        
                        {/* Result Message */}
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8"
                        >
                          {verificationResult.message}
                        </motion.p>
                        
                        {/* Confidence and Analysis Details */}
                        {verificationResult.prediction !== "error" && verificationResult.confidence > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20"
                          >
                            <h4 className="text-xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-200">
                              🤖 AI Analysis Details
                            </h4>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Confidence Score */}
                              <div className="text-center">
                                <div className="relative inline-block">
                                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                                    verificationResult.confidence > 0.8 ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                                    verificationResult.confidence > 0.6 ? "bg-gradient-to-br from-yellow-500 to-orange-600" :
                                    "bg-gradient-to-br from-red-500 to-rose-600"
                                  }`}>
                                    {(verificationResult.confidence * 100).toFixed(0)}%
                                  </div>
                                  <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
                                    verificationResult.confidence > 0.8 ? "bg-green-500" :
                                    verificationResult.confidence > 0.6 ? "bg-yellow-500" :
                                    "bg-red-500"
                                  }`}></div>
                                </div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300 mt-3">Model Confidence</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {verificationResult.confidence > 0.8 ? "Very High" :
                                   verificationResult.confidence > 0.6 ? "Moderate" : "Low"} Certainty
                                </p>
                              </div>
                              
                              {/* Analysis Stats */}
                              {verificationResult.analysisDetails && (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">📝 Text Length</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                      {verificationResult.analysisDetails.text_length.toLocaleString()} chars
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">🎯 Processing Time</span>
                                    <span className="font-bold text-purple-600 dark:text-purple-400">~2.3s</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Demo Mode Warning */}
                            {verificationResult.demoMode && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-xl"
                              >
                                <p className="text-center text-orange-800 dark:text-orange-300 font-medium">
                                  ⚠️ Demo Mode Active - Using sample predictions for testing
                                </p>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                        
                        {/* Disclaimer */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="mt-8 text-center"
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4">
                            🔬 <strong>AI-Powered Analysis:</strong> This tool uses advanced BERT neural networks trained on educational news data. 
                            Always cross-reference with trusted news sources for important decisions.
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
