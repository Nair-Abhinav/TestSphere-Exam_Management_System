import React, { useEffect, useState, useContext } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Background from "../assets/Background.jpg"
import axios from "axios"
import { UserContext } from "../Context/userContext"
import { handleError, handleSuccess } from "./utils"

const loginTypes = ["Teacher", "HOD", "Administrator"]

const Login = () => {
  const [activeType, setActiveType] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { login } = useContext(UserContext)

  // State for forgot password flow
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const loggedInType = sessionStorage.getItem("loggedInType")

    if (token && loggedInType) {
      redirectToPage(loggedInType)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedType = loginTypes[activeType]
      const endpointMap = {
        Teacher: "teachers/login",
        HOD: "hod/login",
        Administrator: "admin/login",
      }

      const endpoint = endpointMap[selectedType]
      if (!endpoint) throw new Error("Invalid user type")

      // const response = await axios.post(`https://fsd-backend-beta.vercel.app/${endpoint}`, { email, password })
      const response = await axios.post(`http://localhost:5000/${endpoint}`, { email, password })

      if (response.status === 200 && response.data.token) {
        const { token, user } = response.data
        const userName = user?.name || response.data.name

        localStorage.setItem("token", token)
        localStorage.setItem("userName", userName)
        sessionStorage.setItem("loggedInType", selectedType)

        login(userName)

        toast.success(`Welcome back, ${userName}!`)

        redirectToPage(selectedType)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred during login"
      setPassword("")
      handleError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const redirectToPage = (type) => {
    switch (type) {
      case "Teacher":
        navigate("/teacher")
        break
      case "HOD":
        navigate("/HOD")
        break
      case "Administrator":
        navigate("/administrator")
        break
      default:
        navigate("/")
        break
    }
  }

  const resetFormState = () => {
    setEmail("")
    setPassword("")
    setOtp("")
    setNewPassword("")
    setConfirmPassword("")
    setForgotPasswordStep(0)
  }

  // Update the handleForgotPassword function in Login.jsx
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const selectedType = loginTypes[activeType];
      // Define base routes for each user type
      const baseRoutes = {
        Teacher: 'teachers',
        HOD: 'hod',
        Administrator: 'admin'
      };
      
      // Get the correct base route for the selected user type
      const baseRoute = baseRoutes[selectedType];
      if (!baseRoute) {
        throw new Error('Invalid user type');
      }
      
      switch (forgotPasswordStep) {
        case 1: // Send OTP
          const sendOtpResponse = await axios.post(`http://localhost:5000/${baseRoute}/forgot-password`, {
            email
          });
          if (sendOtpResponse.status === 200) {
            setForgotPasswordStep(2);
            handleSuccess('OTP sent to your email!');
          }
          break;
  
        case 2: // Verify OTP
          const verifyOtpResponse = await axios.post(`http://localhost:5000/${baseRoute}/verify-otp`, {
            email,
            otp
          });
          if (verifyOtpResponse.status === 200) {
            localStorage.setItem('resetToken', verifyOtpResponse.data.resetToken);
            setForgotPasswordStep(3);
            handleSuccess('OTP verified successfully!');
          }
          break;
  
        case 3: // Set new password
          if (newPassword !== confirmPassword) {
            throw new Error('Passwords do not match');
          }
          
          const resetToken = localStorage.getItem('resetToken');
          const resetPasswordResponse = await axios.post(`http://localhost:5000/${baseRoute}/reset-password`, {
            resetToken,
            newPassword
          });
  
          if (resetPasswordResponse.status === 200) {
            handleSuccess('Password reset successfully! Please log in with your new password.');
            localStorage.removeItem('resetToken');
            resetFormState();
          }
          break;
      }
    } catch (error) {
      handleError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBackToLoginButton = () => (
    <div className="mt-4 text-center">
      <button onClick={resetFormState} className="text-sm font-medium text-gray-600 hover:text-gray-900">
        Back to Login
      </button>
    </div>
  )

  const renderForgotPasswordForm = () => {
    let form
    switch (forgotPasswordStep) {
      case 1:
        form = (
          <motion.form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </motion.button>
          </motion.form>
        )
        break
      case 2:
        form = (
          <motion.form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>
          </motion.form>
        )
        break
      case 3:
        form = (
          <motion.form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </motion.button>
          </motion.form>
        )
        break
      default:
        form = null
    }

    return (
      <>
        {form}
        {renderBackToLoginButton()}
      </>
    )
  }

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden">
      <ToastContainer position="top-right" />
      {/* Left side - Login form */}
      <div className="w-[55%] min-h-screen z-10 flex items-center justify-center bg-white relative">
        <div className="w-[440px] p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              {forgotPasswordStep === 0 ? "Welcome back" : "Forgot Password"}
            </h2>
            {forgotPasswordStep === 0 && (
              <div className="flex space-x-2">
                {loginTypes.map((type, index) => (
                  <motion.button
                    key={type}
                    onClick={() => setActiveType(index)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      activeType === index ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            )}

            {forgotPasswordStep === 0 ? (
              <motion.form
                key={activeType}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? "Logging in..." : `Login as ${loginTypes[activeType]}`}
                </motion.button>
                <div className="text-sm">
                  {/* <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      resetFormState()
                      setForgotPasswordStep(1)
                    }}
                    className="font-medium text-gray-600 hover:text-gray-900"
                  >
                    Forgot your password?
                  </a> */}
                </div>
              </motion.form>
            ) : (
              renderForgotPasswordForm()
            )}
          </motion.div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="flex-1 bg-gray-100 relative z-0">
        <div className="relative h-screen w-full">
          <img src={Background || "/placeholder.svg"} alt="Login background" className="object-cover w-full h-full" />
        </div>
      </div>
    </div>
  )
}

export default Login

