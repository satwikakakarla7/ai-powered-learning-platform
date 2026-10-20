import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Divider,
} from "@mui/material";

import API from "./api";
import Register from "./Register";

import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8B5CF6",
      light: "#C4B5FD",
      dark: "#6D28D9",
    },
    secondary: {
      main: "#A78BFA",
    },
    background: {
      default: "#111827",
      paper: "#1F2937",
    },
    text: {
      primary: "#F9FAFB",
      secondary: "#D1D5DB",
    },
    divider: "#374151",
    success: {
      main: "#34D399",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 18px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #374151",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 10,
          borderRadius: 10,
          backgroundColor: "#374151",
        },
        bar: {
          borderRadius: 10,
          background: "linear-gradient(90deg, #7C3AED, #C4B5FD)",
        },
      },
    },
  },
});

/* =========================
   LOGIN
========================= */

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage("Please enter username and password.");
      return;
    }

    try {
    const response = await API.post("/token/", {
  username,
  password,
});

localStorage.setItem("token", response.data.access);

const profile = await API.get("/users/profile/");

localStorage.setItem("username", profile.data.username);
localStorage.setItem("role", profile.data.role);
localStorage.setItem("userId", profile.data.id);

if (profile.data.role === "teacher") {
  navigate("/teacher-dashboard");
} else if (profile.data.role === "admin") {
  navigate("/admin-dashboard");
} else {
  navigate("/dashboard");
}
    } catch (error) {
      console.log(error);
      setMessage("Invalid username or password.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: 4,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mb: 3,
              }}
            >
              AI Learning Platform
            </Typography>

            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                py: 1.2,
              }}
              onClick={login}
            >
              Login
            </Button>
             <Typography sx={{ mt: 2 }}>
  Don't have an account?{" "}
  <Button onClick={() => navigate("/register")}>
    Register
  </Button>
</Typography>
            {message && (
              <Typography
                color="error"
                sx={{ mt: 2 }}
              >
                {message}
              </Typography>
              
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}


/* =========================
   STUDENT DASHBOARD
========================= */



function Dashboard() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [enrollmentResponse, progressResponse] =
        await Promise.all([
          API.get("/courses/my-enrollments/"),
          API.get("/courses/progress/"),
        ]);

      const enrollmentData = Array.isArray(enrollmentResponse.data)
        ? enrollmentResponse.data
        : enrollmentResponse.data.results || [];

      const progressData = Array.isArray(progressResponse.data)
        ? progressResponse.data
        : progressResponse.data.results || [];

      setEnrollments(enrollmentData);
      setProgress(progressData);

      try {
        const quizResponse = await API.get("/courses/quiz-attempts/");
        const quizData = Array.isArray(quizResponse.data)
          ? quizResponse.data
          : quizResponse.data.results || [];

        setQuizAttempts(quizData);
      } catch (error) {
        console.log("Quiz attempts API not available yet.");
        setQuizAttempts([]);
      }
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const totalLessons = enrollments.reduce(
    (total, enrollment) =>
      total + (enrollment.course?.lessons_count || 0),
    0
  );

  const completedLessons = progress.filter(
    (item) => item.completed === true
  ).length;

  const overallProgress =
    totalLessons > 0
      ? Math.min(
          100,
          Math.round((completedLessons / totalLessons) * 100)
        )
      : 0;

  const handleLogout = () => {
    ["token", "refresh", "role", "username", "userId"].forEach(
      (key) => localStorage.removeItem(key)
    );
    navigate("/login");
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Welcome back, {localStorage.getItem("username") || "Student"}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Pick up where you left off.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        {/* OVERVIEW */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            mb: 4,
          }}
        >
          {[
            {
              label: "Enrolled courses",
              value: enrollments.length,
            },
            {
              label: "Lessons completed",
              value: completedLessons,
            },
            {
              label: "Quiz attempts",
              value: quizAttempts.length,
            },
          ].map((item) => (
            <Card
              key={item.label}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* OVERALL PROGRESS */}
       
<Card
  sx={{
    bgcolor: "#111827",
    color: "#F9FAFB",
    border: "1px solid #374151",
    borderRadius: 3,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    mb: 4,
  }}
>
  <CardContent sx={{ p: 3 }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Your learning journey
        </Typography>
        <Typography variant="body2" sx={{ color: "#C4B5FD", mt: 0.5 }}>
          Every lesson brings you closer to your goal.
        </Typography>
      </Box>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ color: "#C4B5FD" }}
      >
        {overallProgress}%
      </Typography>
    </Box>

    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
        Course progress
      </Typography>
      <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
        {completedLessons} / {totalLessons} lessons
      </Typography>
    </Box>

    <LinearProgress
      variant="determinate"
      value={overallProgress}
      sx={{
        height: 14,
        borderRadius: 10,
        bgcolor: "#374151",
        "& .MuiLinearProgress-bar": {
          borderRadius: 10,
          background: "linear-gradient(90deg, #7C3AED, #C4B5FD)",
          boxShadow: "0 0 12px rgba(139,92,246,0.55)",
          transition: "transform 0.8s ease",
        },
      }}
    />

    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
        {totalLessons === 0
          ? "Enroll in a course to start tracking your progress."
          : overallProgress === 100
          ? "Amazing work! You completed all your lessons."
          : overallProgress >= 75
          ? "You're close to your goal. Keep going!"
          : overallProgress >= 40
          ? "Great progress. Keep the momentum going!"
          : "Your learning journey starts here. Keep going!"}
      </Typography>

      <Typography variant="caption" sx={{ color: "#C4B5FD" }}>
        Next milestone: {overallProgress >= 100 ? "Completed" : `${Math.min(100, (Math.floor(overallProgress / 25) + 1) * 25)}%`}
      </Typography>
    </Box>
  </CardContent>
</Card>

        {/* COURSE SECTION */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Continue learning
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Your enrolled courses and learning resources
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate("/courses")}
          >
            Explore courses
          </Button>
        </Box>

        {enrollments.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" fontWeight={600}>
                Start your learning journey
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Explore available courses and enroll to get started.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/courses")}
              >
                Browse courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;

              return (
                <Card
                  key={enrollment.id}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    transition: "0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {course.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        mb: 2.5,
                        minHeight: 40,
                      }}
                    >
                      {course.description ||
                        "Access recorded lessons and study materials for this course."}
                    </Typography>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/lessons/${course.id}`)}
                      sx={{ mb: 2 }}
                    >
                      Continue learning
                    </Button>

                    <Divider sx={{ mb: 1.5 }} />

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Button
                        size="small"
                        onClick={() => navigate(`/materials/${course.id}`)}
                      >
                        Study materials
                      </Button>

                      <Button
                        size="small"
                        onClick={() => navigate(`/quiz/${course.id}`)}
                      >
                        Quizzes
                      </Button>

                      <Button
                        size="small"
                        onClick={() => navigate(`/ai/${course.id}`)}
                      >
                        Ask AI
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Container>
  );

}

/* =========================
   AVAILABLE COURSES
========================= */

function Courses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await API.get(
        "/courses/list/"
      );
      console.log("COURSE API RESPONSE:", response.data);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
        console.log("ALL COURSES:", data);
      setCourses(data);
    } catch (error) {
      console.log(error.response?.data);
      setMessage("Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const enrollCourse = async (courseId) => {
    try {
      await API.post("/courses/enroll/", {
        course_id: courseId,
      });

      setMessage("Enrolled successfully!");
    } catch (error) {
      console.log(error.response?.data);
      setMessage("Unable to enroll in course.");
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5">
            Loading courses...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>

        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: 3,
          }}
        >
          📚 Available Courses
        </Typography>

        {message && (
          <Typography sx={{ mb: 3 }}>
            {message}
          </Typography>
        )}

        {courses.length === 0 ? (
          <Card sx={{ p: 3 }}>
            <Typography>
              No courses are available yet.
            </Typography>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 3,
            }}
          >
            {courses.map((course) => (
              <Card
                key={course.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              >
                <CardContent>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold" }}
                  >
                    {course.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    {course.description}
                  </Typography>

                  <Typography sx={{ mt: 2 }}>
                    <b>Teacher:</b>{" "}
                    {course.teacher_username ||
                      course.teacher ||
                      "Teacher"}
                  </Typography>

                  <Button
                    variant="contained"
                    sx={{
                      mt: 3,
                      mr: 2,
                    }}
                    onClick={() =>
                      enrollCourse(course.id)
                    }
                  >
                    Enroll
                  </Button>

                  <Button
                    variant="outlined"
                    sx={{ mt: 3 }}
                    onClick={() =>
                      navigate(
                        `/quiz/${course.id}`
                      )
                    }
                  >
                    View Quiz
                  </Button>
                  <Button
  variant="contained"
  onClick={() => navigate("/courses")}
  sx={{ mt: 2 }}
>
  Browse Courses
</Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}


/* =========================
   MY COURSES
========================= */

function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadEnrollments();
    loadProgress();
  }, []);

  const loadEnrollments = async () => {
    try {
      const response = await API.get(
        "/courses/my-enrollments/"
      );

      setEnrollments(response.data);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await API.get(
        "/courses/progress/"
      );

      setProgress(response.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5">
            Loading your courses...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>

        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: 4,
          }}
        >
          My Enrolled Courses
        </Typography>

        {enrollments.length === 0 ? (
          <Typography>
            You have not enrolled in any courses yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 3,
            }}
          >
            {enrollments.map((enrollment) => {
              const course = enrollment.course;

              const courseProgress =
                progress.filter(
                  (item) =>
                    item.course_id === course?.id &&
                    item.completed
                ).length;

              const totalLessons =
                course?.lessons_count || 0;

              const percentage =
                totalLessons > 0
                  ? Math.round(
                      (courseProgress /
                        totalLessons) *
                        100
                    )
                  : 0;

              return (
                <Card
                  key={enrollment.id}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    boxShadow: 3,
                  }}
                >
                  <CardContent>

                    <Typography
                      variant="h5"
                      sx={{ fontWeight: "bold" }}
                    >
                      {course?.title || "Course"}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      {course?.description || ""}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 3,
                        fontWeight: "bold",
                      }}
                    >
                      Progress: {percentage}%
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        mt: 1,
                        height: 8,
                        borderRadius: 5,
                      }}
                    />

                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {courseProgress} of{" "}
                      {totalLessons} lessons completed
                    </Typography>

                  
<Button
  variant="contained"
  sx={{ mt: 3 }}
  onClick={() =>
    navigate(`/lessons/${course?.id}`)
  }
>
  View Lessons
</Button>

<Button
  variant="outlined"
  sx={{ mt: 2, ml: 2 }}
  onClick={() =>
    navigate(`/materials/${course?.id}`)
  }
>
  📄 Study Materials
</Button>

<Button
  variant="outlined"
  sx={{ mt: 2, ml: 2 }}
  onClick={() =>
    navigate(`/quiz/${course?.id}`)
  }
>
  📝 Take Quiz
</Button>

<Button
  variant="outlined"
  sx={{ mt: 2, ml: 2 }}
  onClick={() =>
    navigate(`/ai/${course?.id}`)
  }
>
  🤖 Ask AI
</Button>



                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Container>
  );
}


/* =========================
   LESSONS
========================= */

function LessonsPage() {
  const { courseId } = useParams();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  const loadLessons = async () => {
    try {
      setLoading(true);

      const [lessonsResponse, progressResponse] =
        await Promise.all([
          API.get(`/courses/lessons/${courseId}/`),
          API.get("/courses/progress/"),
        ]);

      const lessonsData = Array.isArray(lessonsResponse.data)
        ? lessonsResponse.data
        : lessonsResponse.data.results || [];

      const progressData = Array.isArray(progressResponse.data)
        ? progressResponse.data
        : progressResponse.data.results || [];

      const completedLessonIds = progressData
        .filter((item) => item.completed === true)
        .map((item) => Number(item.lesson));

      setLessons(
        lessonsData.map((lesson) => ({
          ...lesson,
          completed: completedLessonIds.includes(
            Number(lesson.id)
          ),
        }))
      );
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (lessonId) => {
    try {
      await API.post("/courses/progress/create/", {
        lesson: lessonId,
      });

      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, completed: true }
            : lesson
        )
      );

      alert("Lesson completed successfully!");
    } catch (error) {
      console.log(error.response?.data);
      alert("Unable to update progress.");
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5">
            Loading recorded classes...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 4 }}
        >
          Recorded Video Classes
        </Typography>

        {lessons.length === 0 ? (
          <Typography>
            No recorded classes are available for this course yet.
          </Typography>
        ) : (
          lessons.map((lesson, index) => {
            const videoPath = lesson.video_file;
            const videoUrl = lesson.video_url;

            const uploadedVideo =
              typeof videoPath === "string" &&
              videoPath.trim() !== "";

            const playableUrl = uploadedVideo
              ? videoPath.startsWith("http")
                ? videoPath
                : `${API.defaults.baseURL.replace(/\/api\/?$/, "")}${videoPath.startsWith("/") ? "" : "/media/"}${videoPath.startsWith("/") ? videoPath : videoPath.replace(/^\/+/, "")}`
              : videoUrl;

            return (
              <Card
                key={lesson.id}
                sx={{
                  mb: 4,
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", mb: 2 }}
                  >
                    {index + 1}. {lesson.title}
                  </Typography>

                  {playableUrl ? (
                    <Box
                      component="video"
                      controls
                      preload="metadata"
                      sx={{
                        width: "100%",
                        maxHeight: 480,
                        backgroundColor: "#000",
                        borderRadius: 2,
                      }}
                    >
                      <source
                        src={playableUrl}
                        type="video/mp4"
                      />
                      Your browser cannot play this video.
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No video has been uploaded for this class yet.
                    </Typography>
                  )}

                  <Button
                    variant={lesson.completed ? "contained" : "outlined"}
                    color={lesson.completed ? "success" : "primary"}
                    sx={{ mt: 3 }}
                    disabled={lesson.completed}
                    onClick={() => markCompleted(lesson.id)}
                  >
                    {lesson.completed
                      ? "✓ Completed"
                      : "Mark as Completed"}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
    </Container>
  );
}


/* =========================
   QUIZ PAGE
========================= */

function QuizPage() {
  const { courseId } = useParams();

  const [quizzes, setQuizzes] = useState([]);
const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadQuiz();
  }, [courseId]);

const loadQuiz = async () => {
  try {
    setLoading(true);
    setMessage("");

    const quizResponse = await API.get(
      `/courses/quizzes/${courseId}/`
    );

    const quizData = Array.isArray(quizResponse.data)
      ? quizResponse.data
      : quizResponse.data.results || [];

    setQuizzes(quizData);

    if (quizData.length === 0) {
      setMessage(
        "No quiz is available for this course yet."
      );
    }
  } catch (error) {
    console.log(error.response?.data || error);
    setMessage("Unable to load quizzes.");
  } finally {
    setLoading(false);
  }
};
const openQuiz = async (selectedQuiz) => {
  try {
    setLoading(true);
    setMessage("");
    setResult(null);
    setAnswers({});

    setQuiz(selectedQuiz);

    const questionResponse = await API.get(
      `/courses/quizzes/${selectedQuiz.id}/questions/`
    );

    const questionData = Array.isArray(
      questionResponse.data
    )
      ? questionResponse.data
      : questionResponse.data.results || [];

    setQuestions(questionData);
  } catch (error) {
    console.log(error.response?.data || error);
    setMessage("Unable to load quiz questions.");
  } finally {
    setLoading(false);
  }
};
  const handleAnswer = (
    questionId,
    answer
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    if (questions.length === 0) {
      setMessage(
        "This quiz has no questions yet."
      );
      return;
    }

    try {
      const response = await API.post(
        "/courses/quiz-attempts/create/",
        {
          quiz: quiz.id,
          answers,
        }
      );

      setResult(response.data);
    } catch (error) {
      console.log(error);
      setMessage(
        "Unable to submit quiz."
      );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5">
            Loading quiz...
          </Typography>
        </Box>
      </Container>
    );
  }
  if (!quiz) {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 3,
          }}
        >
          🧠 Course Quizzes
        </Typography>

        {quizzes.length === 0 ? (
          <Typography color="text.secondary">
            {message || "No quizzes available."}
          </Typography>
        ) : (
          quizzes.map((item) => (
            <Card
              key={item.id}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>

                <Button
                  variant="contained"
                  onClick={() => openQuiz(item)}
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))
        )}

        {message && (
          <Typography
            color="error"
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
}
  if (result) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 5, mb: 5 }}>
          <Card
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mb: 3,
              }}
            >
              Quiz Result
            </Typography>

            <Typography
              variant="h5"
              sx={{ mb: 2 }}
            >
              Score: {result.score} /{" "}
              {result.total_questions}
            </Typography>

            <Typography
              variant="h6"
              sx={{ mb: 3 }}
            >
              Percentage:{" "}
              {result.percentage}%
            </Typography>

            <Button
              variant="contained"
              onClick={() =>
                navigate("/courses")
              }
            >
              Back to Courses
            </Button>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: 4,
          }}
        >

          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 1,
            }}
          >
            🧠{" "}
            {quiz ? quiz.title : "Quiz"}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Answer all questions and submit
            your quiz.
          </Typography>

          {questions.map(
            (question, index) => (
              <Card
                key={question.id}
                variant="outlined"
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <CardContent>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: 2,
                    }}
                  >
                    {index + 1}.{" "}
                    {question.question_text}
                  </Typography>

                  <RadioGroup
                    value={
                      answers[question.id] || ""
                    }
                    onChange={(event) =>
                      handleAnswer(
                        question.id,
                        event.target.value
                      )
                    }
                  >

                    <FormControlLabel
                      value="A"
                      control={<Radio />}
                      label={`A. ${question.option_a}`}
                    />

                    <FormControlLabel
                      value="B"
                      control={<Radio />}
                      label={`B. ${question.option_b}`}
                    />

                    <FormControlLabel
                      value="C"
                      control={<Radio />}
                      label={`C. ${question.option_c}`}
                    />

                    <FormControlLabel
                      value="D"
                      control={<Radio />}
                      label={`D. ${question.option_d}`}
                    />

                  </RadioGroup>

                </CardContent>
              </Card>
            )
          )}

          {questions.length > 0 && (
            <Button
              variant="contained"
              fullWidth
              sx={{
                py: 1.4,
                mt: 1,
              }}
              onClick={submitQuiz}
            >
              Submit Quiz
            </Button>
          )}

          {message && (
            <Typography
              color="error"
              sx={{
                mt: 3,
                fontWeight: "bold",
              }}
            >
              {message}
            </Typography>
          )}

        </Card>
      </Box>
    </Container>
  );
}


/* =========================
   AI PAGE
========================= */

function AIPage() {
  const { courseId } = useParams();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;

    if (!courseId) {
      setAnswer("Please open AI Doubt Solver from a course.");
      return;
    }

    setLoading(true);
    setAnswer("");
 console.log("AI COURSE ID:", courseId);
    try {
      const response = await API.post(
        "/courses/ai-doubt/",
        {
          question,
          course_id: Number(courseId),
        }
      );

      setAnswer(response.data.answer);
    } catch (error) {
      console.log(error.response?.data || error);
      setAnswer(
        error.response?.data?.error ||
          "Unable to get AI response."
      );
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>

        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: 1,
          }}
        >
          🤖 AI Doubt Solver
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Ask questions about the study material uploaded for this course.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Ask your doubt"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
        />

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={askAI}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask AI"}
        </Button>

        {answer && (
          <Card sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6">
              AI Answer
            </Typography>

            <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>
              {answer}
            </Typography>
          </Card>
        )}

      </Box>
    </Container>
  );
}


/* =========================
   TEACHER DASHBOARD
========================= */
function TeacherDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [myCourses, setMyCourses] = useState([]);

  const [quizTitle, setQuizTitle] = useState("");
  const [quizCourseId, setQuizCourseId] = useState("");
  const [myQuizzes, setMyQuizzes] = useState([]);

  const [questionQuizId, setQuestionQuizId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  const [message, setMessage] = useState("");

  const [materialCourseId, setMaterialCourseId] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState(null);
  const [materials, setMaterials] = useState([]);

  const navigate = useNavigate();

  const loadMyCourses = async () => {
    try {
      const response = await API.get("/courses/list/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      const userId = localStorage.getItem("userId");

      const courses = data.filter(
        (course) =>
          String(course.teacher) === String(userId)
      );

      setMyCourses(courses);

      return courses;
    } catch (error) {
      console.log(error.response?.data);
      return [];
    }
  };

  const loadMyQuizzes = async (courses) => {
    try {
      let allQuizzes = [];

      for (const course of courses) {
        const response = await API.get(
          `/courses/quizzes/${course.id}/`
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        allQuizzes = [...allQuizzes, ...data];
      }

      setMyQuizzes(allQuizzes);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await API.get(
        "/courses/materials/"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setMaterials(data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    const loadTeacherData = async () => {
      const courses = await loadMyCourses();

      await loadMyQuizzes(courses);

      await loadMaterials();
    };

    loadTeacherData();
  }, []);

  const createCourse = async () => {
    if (!title.trim() || !description.trim()) {
      setMessage(
        "Please enter course title and description."
      );
      return;
    }

    try {
      await API.post(
        "/courses/create/",
        {
          title,
          description,
        }
      );

      setMessage(
        "Course created successfully!"
      );

      setTitle("");
      setDescription("");

      const courses = await loadMyCourses();

      await loadMyQuizzes(courses);
    } catch (error) {
      console.log(error);

      setMessage(
        "Unable to create course."
      );
    }
  };

  const createQuiz = async () => {
    if (!quizTitle.trim() || !quizCourseId) {
      setMessage(
        "Please enter quiz title and select a course."
      );
      return;
    }

    try {
      const response = await API.post(
        "/courses/quizzes/create/",
        {
          course: Number(quizCourseId),
          title: quizTitle,
        }
      );

      setMessage(
        `Quiz created successfully! Quiz ID: ${response.data.id}`
      );

      setQuizTitle("");
      setQuizCourseId("");

      setMyQuizzes((previous) => [
        ...previous,
        response.data,
      ]);
    } catch (error) {
      console.log(error);

      setMessage(
        "Unable to create quiz."
      );
    }
  };

  const addQuestion = async () => {
    if (
      !questionQuizId ||
      !questionText.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim() ||
      !correctAnswer.trim()
    ) {
      setMessage(
        "Please select a quiz and fill all question fields."
      );
      return;
    }

    const answer =
      correctAnswer.trim().toUpperCase();

    if (
      !["A", "B", "C", "D"].includes(answer)
    ) {
      setMessage(
        "Correct answer must be A, B, C, or D."
      );
      return;
    }

    try {
      await API.post(
        "/courses/questions/create/",
        {
          quiz: Number(questionQuizId),
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: answer,
        }
      );

      setMessage(
        "Question added successfully!"
      );

      setQuestionQuizId("");
      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("");
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data
          ? JSON.stringify(
              error.response.data
            )
          : "Unable to add question."
      );
    }
  };

  const uploadMaterial = async () => {
    if (
      !materialCourseId ||
      !materialTitle.trim() ||
      !materialFile
    ) {
      setMessage(
        "Please select a course, enter PDF title and choose a PDF."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "course",
      materialCourseId
    );

    formData.append(
      "title",
      materialTitle
    );

    formData.append(
      "pdf",
      materialFile
    );

    try {
      await API.post(
        "/courses/materials/upload/",
        formData
      );

      setMessage(
        "PDF uploaded successfully!"
      );

      setMaterialCourseId("");
      setMaterialTitle("");
      setMaterialFile(null);

      await loadMaterials();
    } catch (error) {
      console.log(
        error.response?.data
      );

      setMessage(
        error.response?.data
          ? JSON.stringify(
              error.response.data
            )
          : "PDF upload failed."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/");
  };

  return (
    <Container maxWidth="lg">

      <Box sx={{ mt: 5, mb: 5 }}>

        {/* HEADER */}

        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: 1,
          }}
        >
          Teacher Dashboard
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Welcome {localStorage.getItem("username")} 👨‍🏫
        </Typography>

        {/* DASHBOARD GRID */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: 3,
          }}
        >

          {/* CREATE COURSE */}

          <Card
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                }}
              >
                📚 Create Course
              </Typography>

              <TextField
                fullWidth
                placeholder="Enter course title"
                margin="normal"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter course description"
                margin="normal"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.2,
                }}
                onClick={createCourse}
              >
                Create Course
              </Button>

            </CardContent>
          </Card>

          {/* CREATE LESSON */}

          <Card
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: 3,
              cursor: "pointer",
            }}
            onClick={() =>
              navigate("/create-lesson")
            }
          >
            <CardContent>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                }}
              >
                📝 Create Lesson
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Add lessons and learning content
                to your courses.
              </Typography>

              <Button
                variant="contained"
              >
                Add Lesson
              </Button>

            </CardContent>
          </Card>

          {/* CREATE QUIZ */}

          <Card
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                }}
              >
                🧠 Create Quiz
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Create a quiz for one of
                your courses.
              </Typography>

              <TextField
                select
                fullWidth
                margin="normal"
                value={quizCourseId}
                onChange={(e) =>
                  setQuizCourseId(
                    e.target.value
                  )
                }
              slotProps={{
  select: {
    displayEmpty: true,
  },
}}
              >
                <MenuItem value="">
                  Select Course
                </MenuItem>

                {myCourses.map((course) => (
                  <MenuItem
                    key={course.id}
                    value={course.id}
                  >
                    {course.title}
                  </MenuItem>
                ))}
              </TextField>
                <Typography>
</Typography>
              <TextField
                fullWidth
                placeholder="Enter quiz title"
                margin="normal"
                value={quizTitle}
                onChange={(e) =>
                  setQuizTitle(
                    e.target.value
                  )
                }
              />

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.2,
                }}
                onClick={createQuiz}
              >
                Create Quiz
              </Button>

            </CardContent>
          </Card>

          {/* ADD QUESTION */}

          <Card
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                }}
              >
                ❓ Add Question
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Add a multiple-choice question
                to your quiz.
              </Typography>
<TextField
  select
  fullWidth
  margin="normal"
  value={questionQuizId}
  onChange={(e) => {
    console.log("SELECTED QUIZ ID:", e.target.value);
    setQuestionQuizId(e.target.value);
  }}
  slotProps={{
    select: {
      displayEmpty: true,
    },
  }}
>
  <MenuItem value="">
    Select Quiz
  </MenuItem>

  {myQuizzes.map((quiz) => (
    <MenuItem
      key={quiz.id}
      value={quiz.id}
    >
      {quiz.title}
    </MenuItem>
  ))}
</TextField>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter question"
                margin="normal"
                value={questionText}
                onChange={(e) =>
                  setQuestionText(
                    e.target.value
                  )
                }
              />

              <TextField
                fullWidth
                placeholder="Option A"
                margin="normal"
                value={optionA}
                onChange={(e) =>
                  setOptionA(e.target.value)
                }
              />

              <TextField
                fullWidth
                placeholder="Option B"
                margin="normal"
                value={optionB}
                onChange={(e) =>
                  setOptionB(e.target.value)
                }
              />

              <TextField
                fullWidth
                placeholder="Option C"
                margin="normal"
                value={optionC}
                onChange={(e) =>
                  setOptionC(e.target.value)
                }
              />

              <TextField
                fullWidth
                placeholder="Option D"
                margin="normal"
                value={optionD}
                onChange={(e) =>
                  setOptionD(e.target.value)
                }
              />

              <TextField
                select
                fullWidth
                margin="normal"
                value={correctAnswer}
                onChange={(e) =>
                  setCorrectAnswer(
                    e.target.value
                  )
                }
              slotProps={{
  select: {
    displayEmpty: true,
  },
}}
              >
                <MenuItem value="">
                  Correct Answer
                </MenuItem>

                <MenuItem value="A">
                  A
                </MenuItem>

                <MenuItem value="B">
                  B
                </MenuItem>

                <MenuItem value="C">
                  C
                </MenuItem>

                <MenuItem value="D">
                  D
                </MenuItem>
              </TextField>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.2,
                }}
                onClick={addQuestion}
              >
                Add Question
              </Button>

            </CardContent>
          </Card>

          {/* UPLOAD PDF */}

          <Card
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                }}
              >
                📄 Upload Course PDF
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Upload study material for
                your course.
              </Typography>

              <TextField
                select
                fullWidth
                margin="normal"
                value={materialCourseId}
                onChange={(e) =>
                  setMaterialCourseId(
                    e.target.value
                  )
                }
               slotProps={{
  select: {
    displayEmpty: true,
  },
}}
              >
                <MenuItem value="">
                  Select Course
                </MenuItem>

                {myCourses.map((course) => (
                  <MenuItem
                    key={course.id}
                    value={course.id}
                  >
                    {course.title}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                placeholder="Enter PDF title"
                margin="normal"
                value={materialTitle}
                onChange={(e) =>
                  setMaterialTitle(
                    e.target.value
                  )
                }
              />

              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setMaterialFile(
                      e.target.files[0]
                    )
                  }
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.2,
                }}
                onClick={uploadMaterial}
              >
                Upload PDF
              </Button>

            </CardContent>
          </Card>

        </Box>

        {/* UPLOADED MATERIALS */}

        <Card
          sx={{
            mt: 4,
            p: 2,
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent>

            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                mb: 3,
              }}
            >
              📚 Uploaded Course Materials
            </Typography>

            {materials.length === 0 ? (
              <Typography color="text.secondary">
                No course materials uploaded yet.
              </Typography>
            ) : (
              materials.map((material) => {

                const course =
                  myCourses.find(
                    (item) =>
                      String(item.id) ===
                      String(material.course)
                  );

                return (
                  <Card
                    key={material.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                    }}
                  >

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {material.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Course:{" "}
                      {course
                        ? course.title
                        : `Course ${material.course}`}
                    </Typography>

                           variant="body2"
                 <Typography
                    color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Uploaded:{" "}
                      {material.uploaded_at
                        ? new Date(
                            material.uploaded_at
                          ).toLocaleString()
                        : "Unknown"}
                    </Typography>
                 {material.pdf ? (
 <Button
  variant="outlined"
  sx={{ mt: 2 }}
  onClick={() => window.open(material.pdf, "_blank")}
>
  View PDF
</Button>
) : (
  <Typography
    color="error"
    sx={{ mt: 2 }}
  >
    PDF file is not available.
  </Typography>
)}

                  </Card>
                );
              })
            )}

          </CardContent>
        </Card>

        {/* MESSAGE */}

        {message && (
          <Typography
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            }}
          >
            {message}
          </Typography>
        )}

        {/* LOGOUT */}

        <Box sx={{ mt: 5 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={logout}
          >
            Logout
          </Button>
        </Box>

      </Box>
    </Container>
  );
}

/* =========================
   CREATE LESSON
========================= */


function LessonCreate() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await API.get("/courses/list/");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        const userId = localStorage.getItem("userId");

        setCourses(
          data.filter(
            (course) =>
              String(course.teacher) === String(userId)
          )
        );
      } catch (error) {
        console.log(error.response?.data);
        setMessage("Unable to load your courses.");
      }
    };

    loadCourses();
  }, []);

  const createLesson = async () => {
    if (!courseId || !title.trim() || !videoFile) {
      setMessage("Please select a course, enter a class title, and choose a video.");
      return;
    }

    if (!videoFile.type.startsWith("video/")) {
      setMessage("Please select a valid video file.");
      return;
    }

    const formData = new FormData();
    formData.append("course", courseId);
    formData.append("title", title.trim());
    formData.append("content", title.trim());
    formData.append("video_file", videoFile);

    setUploading(true);
    setMessage("");

    try {
      await API.post(
        "/courses/lessons/create/",
        formData
      );

      setMessage("Recorded video class uploaded successfully!");
      setCourseId("");
      setTitle("");
      setVideoFile(null);

      const fileInput = document.getElementById("lesson-video");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.log(error.response?.data);
      setMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Video upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Add Recorded Video Class
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Upload a recorded class for students in your course.
        </Typography>

        <TextField
          select
          fullWidth
          required
          label="Select Course"
          margin="normal"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.title}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          required
          label="Class Title"
          placeholder="Example: Introduction to Python"
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography sx={{ mb: 1, fontWeight: "medium" }}>
            Select Video File
          </Typography>

          <input
            id="lesson-video"
            type="file"
            accept="video/*"
            onChange={(e) =>
              setVideoFile(e.target.files?.[0] || null)
            }
          />

          {videoFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {videoFile.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={createLesson}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Video Class"}
        </Button>

        <Button
          sx={{ mt: 2, ml: 2 }}
          onClick={() => navigate("/teacher-dashboard")}
          disabled={uploading}
        >
          Back to Dashboard
        </Button>

        {message && (
          <Typography sx={{ mt: 3, overflowWrap: "anywhere" }}>
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
}



/* =========================
   ADMIN DASHBOARD
========================= */

function AdminDashboard() {
  const [teachers, setTeachers] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [courses, setCourses] =
    useState([]);
  const [stats, setStats] = useState({
  students: 0,
  teachers: 0,
  courses: 0,
  enrollments: 0,
});
  const [message, setMessage] =
    useState("");

  const navigate = useNavigate();
  const loadStats = async () => {
  try {
    const response = await API.get("/courses/admin/statistics/");
    setStats(response.data);
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
  loadTeachers();
  loadStudents();
  loadCourses();
  loadStats();
}, []);

  const loadTeachers = async () => {
    try {
      const response = await API.get(
        "/users/teachers/"
      );

      setTeachers(response.data);
    } catch (error) {
      console.log(
        error.response?.data
      );

      setMessage(
        "Unable to load teachers."
      );
    }
  };


  const loadStudents = async () => {
    try {
      const response = await API.get(
        "/users/students/"
      );

      setStudents(response.data);
    } catch (error) {
      console.log(
        error.response?.data
      );

      setMessage(
        "Unable to load students."
      );
    }
  };


  const loadCourses = async () => {
    try {
      const response = await API.get(
        "/courses/admin/courses/"
      );

      setCourses(response.data);
    } catch (error) {
      console.log(
        error.response?.data
      );

      setMessage(
        "Unable to load courses."
      );
    }
  };


  const verifyTeacher = async (id) => {
    try {
      await API.post(
        `/users/verify-teacher/${id}/`
      );

      setMessage(
        "Teacher verified successfully."
      );

      loadTeachers();

    } catch (error) {
      console.log(
        error.response?.data
      );

      setMessage(
        "Teacher verification failed."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/");
  };
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 5 }}>

        <Typography
          variant="h3"
          sx={{ fontWeight: "bold" }}
        >
          Admin Dashboard
        </Typography>

        <Typography sx={{ mt: 2 }}>
          Welcome,{" "}
          {localStorage.getItem(
            "username"
          )}
          !
        </Typography>

        {message && (
          <Typography sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
        <Card sx={{ mt: 4, p: 3 }}>
  <Typography variant="h5">
    📊 Platform Statistics
  </Typography>

  <Typography sx={{ mt: 2 }}>
    <b>Total Students:</b> {stats.students}
  </Typography>

  <Typography>
    <b>Total Teachers:</b> {stats.teachers}
  </Typography>

  <Typography>
    <b>Total Courses:</b> {stats.courses}
  </Typography>

  <Typography>
    <b>Total Enrollments:</b> {stats.enrollments}
  </Typography>
</Card>

        {/* TEACHERS */}

        <Card sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5">
            👨‍🏫 Teacher Management
          </Typography>

          {teachers.length === 0 ? (
            <Typography sx={{ mt: 2 }}>
              No teachers found.
            </Typography>
          ) : (
            teachers.map((teacher) => (
              <Box
                key={teacher.id}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  p: 2,
                  mt: 2,
                }}
              >

                <Typography>
                  <b>Username:</b>{" "}
                  {teacher.username}
                </Typography>

                <Typography>
                  <b>Email:</b>{" "}
                  {teacher.email}
                </Typography>

                <Typography>
                  <b>Status:</b>{" "}
                  {teacher.is_verified
                    ? "Verified"
                    : "Not Verified"}
                </Typography>

                {!teacher.is_verified && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() =>
                      verifyTeacher(
                        teacher.id
                      )
                    }
                  >
                    Verify Teacher
                  </Button>
                )}

              </Box>
            ))
          )}
        </Card>


        {/* STUDENTS */}

        <Card sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5">
            👨‍🎓 Student Management
          </Typography>

          {students.length === 0 ? (
            <Typography sx={{ mt: 2 }}>
              No students found.
            </Typography>
          ) : (
            students.map((student) => (
              <Box
                key={student.id}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  p: 2,
                  mt: 2,
                }}
              >

                <Typography>
                  <b>Username:</b>{" "}
                  {student.username}
                </Typography>

                <Typography>
                  <b>Email:</b>{" "}
                  {student.email}
                </Typography>

                <Typography>
                  <b>Role:</b>{" "}
                  {student.role}
                </Typography>

              </Box>
            ))
          )}
        </Card>


        {/* COURSES */}

      <Card sx={{ mt: 4, p: 3 }}>
  <Typography variant="h5">
    📚 Course Management
  </Typography>

  {courses.length === 0 ? (
    <Typography sx={{ mt: 2 }}>
      No courses found.
    </Typography>
  ) : (
    courses.map((course) => (
      <Box
        key={course.id}
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          mt: 2,
        }}
      >
        <Typography>
          <b>Course:</b>{" "}
          {course.title}
        </Typography>

        <Typography>
          <b>Description:</b>{" "}
          {course.description}
        </Typography>

        <Typography>
          <b>Teacher:</b>{" "}
          {course.teacher_username ||
            course.teacher}
        </Typography>
        <Typography>
  <b>Students Enrolled:</b>{" "}
  {course.students_count || 0}
</Typography>
        <Button
          variant="contained"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (
              !window.confirm(
                "Are you sure you want to delete this course?"
              )
            ) {
              return;
            }

            try {
              await API.delete(
                `/courses/admin/courses/${course.id}/delete/`
              );

              alert("Course deleted successfully!");

              setCourses((prev) =>
                prev.filter(
                  (item) => item.id !== course.id
                )
              );
            } catch (error) {
              console.log(error);
              alert("Failed to delete course.");
            }
          }}
        >
          Delete Course
        </Button>
      </Box>
    ))
  )}
</Card>

        {/* LOGOUT */}

        <Button
          variant="outlined"
          color="error"
          sx={{
            mt: 4,
            mb: 4,
          }}
          onClick={logout}
        >
          Logout
        </Button>

      </Box>
    </Container>
  );
}
function StudentMaterialsPage() {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const response = await API.get(
          `/courses/materials/${courseId}/`
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setMaterials(data);
      } catch (error) {
        console.error("Error loading materials:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [courseId]);

  if (loading) {
    return <Typography>Loading study materials...</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        📚 Study Materials
      </Typography>

      {materials.length === 0 ? (
        <Typography>
          No study materials uploaded for this course yet.
        </Typography>
      ) : (
        materials.map((material) => (
          <Card key={material.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                {material.title}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                Uploaded:{" "}
                {new Date(material.uploaded_at).toLocaleString()}
              </Typography>

<Box sx={{ mt: 2 }}>
  <Button
    variant="contained"
    onClick={() => {
      const pdfUrl = material.pdf?.startsWith("http")
        ? material.pdf
        : `http://127.0.0.1:8000${material.pdf}`;

      window.open(pdfUrl, "_blank");
    }}
  >
    📄 View PDF
  </Button>
</Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}

/* =========================
   APP ROUTES
========================= */

function App() {
  return (
    <Routes>
    <Route path="/register" element={<Register />} />
      <Route path="/" element={<Login />} />
<Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/courses"
        element={<Courses />}
      />

      <Route
        path="/quiz/:courseId"
        element={<QuizPage />}
      />

      <Route
        path="/ai/:courseId"
        element={<AIPage />}
      />

      <Route
        path="/teacher-dashboard"
        element={<TeacherDashboard />}
      />

      <Route
        path="/create-lesson"
        element={<LessonCreate />}
      />

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/my-courses"
        element={<MyCourses />}
      />
      <Route
        path="/materials/:courseId"
        element={<StudentMaterialsPage />}
      />
      <Route
        path="/lessons/:courseId"
        element={<LessonsPage />}
      />

    </Routes>
  );
}

export default App;