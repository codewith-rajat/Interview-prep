import { Route, Routes } from "react-router-dom"
import { ToastProvider } from "./components/ui/Toast"
import Header from "./components/layout/Header"
import Hello from "./components/Hello"
import IntervieweeDashboard from "./components/roles/interviewee/IntervieweeDashboard"
import InterviewRequest from "./components/roles/interviewee/InterviewRequest"
import InterviewerDashboard from "./components/roles/interviewer/InterviewerDashboard"
import Register from "./components/auth/Register"
import Login from "./components/auth/Login"
import CompleteProfile from "./components/auth/CompleteProfile"
import ProtectedRoute from "./components/ProtectedRoutes"
import SetAvailability from "./components/roles/interviewer/SetAvailability"
import VideoCall from "./components/meeting/VideoCall"
import NotFound from "./components/pages/NotFound"
import UserProfile from "./components/pages/UserProfile"

function App() {
  
  return (
    <ToastProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Hello/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route element={<ProtectedRoute/>}>
          <Route path="/complete-profile" element={<CompleteProfile/>} />
          <Route path="/user-profile" element={<UserProfile/>} />
          <Route path="/dashboard/1" element={<IntervieweeDashboard/>} />
          <Route path="/dashboard/2" element={<InterviewerDashboard/>} />
          <Route path="/book-interview/:id" element={<InterviewRequest/>} />
          <Route path="/set-availability" element={<SetAvailability/>} />
          <Route path="video-call/:id" element={<VideoCall/>} />
        </Route>
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </ToastProvider>
  )
}

export default App
