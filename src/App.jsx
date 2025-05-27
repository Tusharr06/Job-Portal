import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import JobsPage from './pages/JobsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import PostJobPage from './pages/PostJobPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AuthPage from './pages/AuthPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route
          path="/applications"
          element={user ? <ApplicationsPage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/post-job"
          element={user ? <PostJobPage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/admin"
          element={user?.email === 'admin@jobconnect.pro' ? <AdminDashboardPage /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  )
}

export default App