import {Routes,Route} from 'react-router-dom';
import HomePage from '../HomePage';
import PostListPage from "../PostListPage";
import PostCreatePage from "../PostCreatePage";
import PostEditPage from "../PostEditPage";
import PostDetailPage from "../PostDetailPage";
import LoginPage from "../LoginPage";
import SignupPage from "../SignupPage";

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/create" element={<PostCreatePage />} />
            <Route path="/posts/:postId/edit" element={<PostEditPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
        </Routes>
    )
}

export default AppRouter