"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import { useToast } from "@/hooks/use-toast"

// Mock the dependencies
jest.mock("next-auth/react")
jest.mock("next/navigation")
jest.mock("@/hooks/use-toast")

describe("LoginForm", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mocks
    const mockRouter = {
      push: jest.fn(),
      refresh: jest.fn(),
    }
    const mockToast = {
      toast: jest.fn(),
    }
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue(mockToast)
    ;(signIn as jest.Mock).mockResolvedValue({ error: null })
  })

  it("renders the login form correctly", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("handles form submission correctly with valid credentials", async () => {
    const mockRouter = useRouter()

    render(<LoginForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        username: "testuser",
        password: "password123",
        redirect: false,
      })
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard")
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it("shows an error toast when login fails", async () => {
    const mockToast = useToast()
    ;(signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" })

    render(<LoginForm />)

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "wronguser" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Authentication failed",
        description: "Invalid username or password",
        variant: "destructive",
      })
    })
  })
})
