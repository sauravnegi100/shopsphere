import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";

const Login = () => <h1>Login Page</h1>;
const Register = () => <h1>Register Page</h1>;
const Products = () => <h1>Products Page</h1>;
const Cart = () => <h1>Cart Page</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// BrowserRouter enables client-side routing in React.
// Routes checks the current URL and renders the matching route.
// Route connects a URL path to a React component.
