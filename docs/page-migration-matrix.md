# Page Migration Matrix

This document inventories the current Django pages and maps each one to:

- the current backend route and Django template/view
- the target React route and component
- the API endpoints React should call
- the migration status and any backend gaps

The goal is to migrate page-by-page without changing UI/UX or business logic.

## Shared Layout Inventory

### Visual source of truth

- Shared base layout: `backend/templates/base.html`
- Dashboard navigation partial: `backend/templates/dashboard/sidebar.html`
- Global SPA shell: `backend/templates/react_app.html`

### Shared UI elements to preserve in React

- Header/logo/search/auth area from `base.html`
- Category navigation bar from `base.html`
- Public sidebar blocks used on home/blog detail
- Dashboard left sidebar navigation
- Bootstrap 4 class structure and current visual hierarchy

### Target React shared components

- `frontend/src/layouts/MainLayout.jsx`
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/components/SearchForm.jsx`
- `frontend/src/components/CategoryNav.jsx`
- `frontend/src/components/PostCard.jsx`
- `frontend/src/components/SocialLinks.jsx`
- `frontend/src/components/dashboard/Sidebar.jsx`

## Public Pages

| Current URL | Current Django view/template | Target React route | Target React page | API dependencies | Status |
| --- | --- | --- | --- | --- | --- |
| `/` | `backend/blog_main/views.py:home` -> `backend/templates/home.html` | `/` | `HomePage.jsx` | `GET /api/site/`, `GET /api/posts/?featured=true`, `GET /api/posts/` | Partial |
| `/category/<id>/` | `backend/blogs/views.py:posts_by_category` -> `backend/templates/posts_by_category.html` | `/category/:categoryId` | `CategoryPostsPage.jsx` | `GET /api/categories/:id/`, `GET /api/posts/?category=:id` | Ready |
| `/blogs/<slug>/` | `backend/blogs/views.py:blogs` -> `backend/templates/blogs.html` | `/blogs/:slug` | `BlogDetailPage.jsx` | `GET /api/posts/:slug/`, `GET /api/posts/:slug/comments/`, `POST /api/posts/:slug/comments/`, `GET /api/site/` | Ready |
| `/search/?keyword=...` | `backend/blogs/views.py:search` -> `backend/templates/search.html` | `/search?keyword=...` | `SearchPage.jsx` | `GET /api/posts/?keyword=:keyword` | Ready |
| `/register/` | `backend/blog_main/views.py:register` -> `backend/templates/register.html` | `/register` | `RegisterPage.jsx` | `POST /api/auth/register/` | Ready |
| `/login/` | `backend/blog_main/views.py:login` -> `backend/templates/login.html` | `/login` | `LoginPage.jsx` | `POST /api/auth/login/`, `GET /api/auth/me/` | Ready |
| `/logout/` | `backend/blog_main/views.py:logout` | handled in React action, then redirect | handled by header/logout action | `POST /api/auth/logout/` | Ready |

### Public page notes

- `GET /api/site/` already provides:
  - `about`
  - `social_links`
  - `categories`
- Search can be reproduced exactly through `GET /api/posts/?keyword=...`.
- Category page can be reproduced through existing filtered post listing plus category detail.
- Blog detail and comments flow can be reproduced from existing post detail and comments endpoints.
- Home page is the only public page that still has a backend payload gap:
  - the old Django `home()` view splits posts into featured and non-featured groups
  - React can fetch two lists from the existing posts endpoint, but a dedicated home endpoint would simplify parity

## Dashboard Pages

| Current URL | Current Django view/template | Target React route | Target React page | API dependencies | Status |
| --- | --- | --- | --- | --- | --- |
| `/dashboard/` | `backend/dashboards/views.py:dashboard` -> `backend/templates/dashboard/dashboard.html` | `/dashboard` | `dashboard/DashboardHomePage.jsx` | `GET /api/dashboard/summary/`, `GET /api/auth/me/` | Ready |
| `/dashboard/categories/` | `backend/dashboards/views.py:categories` -> `backend/templates/dashboard/categories.html` | `/dashboard/categories` | `dashboard/CategoriesPage.jsx` | `GET /api/categories/` | Ready |
| `/dashboard/categories/add/` | `backend/dashboards/views.py:add_category` -> `backend/templates/dashboard/add_category.html` | `/dashboard/categories/add` | `dashboard/CategoryFormPage.jsx` | `POST /api/categories/` | Ready |
| `/dashboard/categories/edit/<id>/` | `backend/dashboards/views.py:edit_category` -> `backend/templates/dashboard/edit_category.html` | `/dashboard/categories/edit/:id` | `dashboard/CategoryFormPage.jsx` | `GET /api/categories/:id/`, `PUT/PATCH /api/categories/:id/` | Ready |
| `/dashboard/categories/delete/<id>/` | `backend/dashboards/views.py:delete_category` | handled from list action | delete action in `CategoriesPage.jsx` | `DELETE /api/categories/:id/` | Ready |
| `/dashboard/posts/` | `backend/dashboards/views.py:posts` -> `backend/templates/dashboard/posts.html` | `/dashboard/posts` | `dashboard/PostsPage.jsx` | `GET /api/posts/`, `GET /api/categories/` | Ready |
| `/dashboard/posts/add/` | `backend/dashboards/views.py:add_post` -> `backend/templates/dashboard/add_post.html` | `/dashboard/posts/add` | `dashboard/PostFormPage.jsx` | `POST /api/posts/`, `GET /api/categories/` | Ready |
| `/dashboard/posts/edit/<id>/` | `backend/dashboards/views.py:edit_post` -> `backend/templates/dashboard/edit_post.html` | `/dashboard/posts/edit/:slug` preferred | `dashboard/PostFormPage.jsx` | `GET /api/posts/:slug/`, `PUT/PATCH /api/posts/:slug/`, `GET /api/categories/` | Partial |
| `/dashboard/posts/delete/<id>/` | `backend/dashboards/views.py:delete_post` | handled from list action | delete action in `PostsPage.jsx` | `DELETE /api/posts/:slug/` | Partial |
| `/dashboard/users/` | `backend/dashboards/views.py:users` -> `backend/templates/dashboard/users.html` | `/dashboard/users` | `dashboard/UsersPage.jsx` | `GET /api/users/`, `GET /api/auth/me/` | Ready |
| `/dashboard/users/add/` | `backend/dashboards/views.py:add_user` -> `backend/templates/dashboard/add_user.html` | `/dashboard/users/add` | `dashboard/UserFormPage.jsx` | `POST /api/users/` | Ready |
| `/dashboard/users/edit/<id>/` | `backend/dashboards/views.py:edit_user` -> `backend/templates/dashboard/edit_user.html` | `/dashboard/users/edit/:id` | `dashboard/UserFormPage.jsx` | `GET /api/users/:id/`, `PUT/PATCH /api/users/:id/` | Ready |
| `/dashboard/users/delete/<id>/` | `backend/dashboards/views.py:delete_user` | handled from list action | delete action in `UsersPage.jsx` | `DELETE /api/users/:id/` | Ready |

### Dashboard notes

- Dashboard templates currently use Django permission checks in the template layer.
- React should use `GET /api/auth/me/` to identify the current user and let the backend remain the true permission gate.
- Category and user CRUD align well with existing endpoints.
- Post editing/deleting is currently a slight mismatch because the DRF post routes use `slug` lookup, while the old Django dashboard routes use numeric `pk`.
- Recommendation: React should standardize on slug-based post editing/deleting for API alignment.

## Existing API Coverage

### Already present

- `GET /api/site/`
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET /api/dashboard/summary/`
- `GET /api/categories/`
- `POST /api/categories/`
- `GET /api/categories/:id/`
- `PUT/PATCH /api/categories/:id/`
- `DELETE /api/categories/:id/`
- `GET /api/posts/`
- `POST /api/posts/`
- `GET /api/posts/:slug/`
- `PUT/PATCH /api/posts/:slug/`
- `DELETE /api/posts/:slug/`
- `GET /api/posts/:slug/comments/`
- `POST /api/posts/:slug/comments/`
- `GET /api/users/`
- `POST /api/users/`
- `GET /api/users/:id/`
- `PUT/PATCH /api/users/:id/`
- `DELETE /api/users/:id/`

### Backend gaps to close before full React parity

1. Home page aggregation
   - Current template view separates featured posts from regular posts.
   - Existing API can reproduce this with multiple requests.
   - Optional improvement: add `GET /api/home/` returning:
     - featured posts
     - recent non-featured posts
     - about
     - social links
     - categories

2. Post edit route identity mismatch
   - Old Django dashboard edits posts by numeric `pk`.
   - DRF edits posts by `slug`.
   - React should use slug routes, or the API should expose a pk-based lookup alias if needed.

3. Frontend auth bootstrap behavior
   - `GET /api/auth/me/` requires authentication and will fail for anonymous visitors.
   - React header state should treat unauthenticated responses as a normal guest state.

4. Static design asset source
   - Templates reference `css/blog.css`.
   - That file is not currently visible in the repo contents.
   - Before page conversion begins, the baseline CSS file should be restored or copied into:
     - `backend/blog_main/static/css/blog.css`
     - optionally mirrored into `frontend/src/styles/` or `frontend/public/` for build-time usage

## React Route Inventory To Create

```text
frontend/src
  layouts/
    MainLayout.jsx
    DashboardLayout.jsx
  pages/
    HomePage.jsx
    CategoryPostsPage.jsx
    BlogDetailPage.jsx
    SearchPage.jsx
    LoginPage.jsx
    RegisterPage.jsx
    dashboard/
      DashboardHomePage.jsx
      CategoriesPage.jsx
      CategoryFormPage.jsx
      PostsPage.jsx
      PostFormPage.jsx
      UsersPage.jsx
      UserFormPage.jsx
  routes/
    AppRouter.jsx
```

## Suggested Conversion Order

1. Shared layout and global routing
2. Home page
3. Search page
4. Category listing page
5. Blog detail and comments
6. Login and register
7. Dashboard summary
8. Dashboard categories
9. Dashboard posts
10. Dashboard users

## Current Step Outcome

This inventory confirms that most required backend APIs already exist.

The main remaining backend blockers before visual migration are:

- restoring the baseline CSS asset if it is missing
- deciding whether to add a dedicated home endpoint
- standardizing how dashboard post edit/delete routes identify posts
