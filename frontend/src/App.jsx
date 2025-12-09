import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FlightSearch from './pages/FlightSearch';
import FlightDetails from './pages/FlightDetails';
import BookingFlow from './pages/BookingFlow';
import BookingHistory from './pages/BookingHistory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="flights" element={<FlightSearch />} />
            <Route path="flights/:id" element={<FlightDetails />} />
            <Route path="booking/:bookingId" element={<BookingFlow />} />
            <Route path="bookings" element={<BookingHistory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
