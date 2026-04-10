import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import HomePage from '../pages/HomePage'
import CategoryPostsPage from '../pages/CategoryPostsPage'
import BlogDetailPage from '../pages/BlogDetailPage'
import SearchPage from '../pages/SearchPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import DashboardHomePage from '../pages/dashboard/DashboardHomePage'
import CategoriesPage from '../pages/dashboard/CategoriesPage'
import CategoryFormPage from '../pages/dashboard/CategoryFormPage'
import PostsPage from '../pages/dashboard/PostsPage'
import PostFormPage from '../pages/dashboard/PostFormPage'
import UsersPage from '../pages/dashboard/UsersPage'
import UserFormPage from '../pages/dashboard/UserFormPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryId" element={<CategoryPostsPage />} />
        <Route path="/blogs/:slug" element={<BlogDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/add" element={<CategoryFormPage mode="create" />} />
          <Route path="categories/edit/:id" element={<CategoryFormPage mode="edit" />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/add" element={<PostFormPage mode="create" />} />
          <Route path="posts/edit/:slug" element={<PostFormPage mode="edit" />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/add" element={<UserFormPage mode="create" />} />
          <Route path="users/edit/:id" element={<UserFormPage mode="edit" />} />
        </Route>
      </Route>

      <Route path="/logout" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
