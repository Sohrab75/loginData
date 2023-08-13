const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
// Import the jwt library
const jwt = require('jsonwebtoken');

// Secret key to sign the token. Keep this secure and do not expose it publicly.
const JWT_SECRET_KEY = 'your-secret-key';

// Function to generate a token for a given user object
const generateToken = (user) => {
  const payload = {
    email: user.email,
    // Add more user data here if needed
  };

  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '5m' });

  return token;
};

const usersFilePath = path.join(__dirname, 'users.json');
app.use(bodyParser.json());
app.use(cors());

// Load existing users data from the JSON file
let users = [];
try {
  const usersData = fs.readFileSync(usersFilePath, 'utf-8');
  users = JSON.parse(usersData);
} catch (error) {
  console.error('Error reading users data:', error);
}

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = users.find((user) => user.email === email);

  if (user && user.password === password) {
      const token = generateToken(user);

    // If login is successful, respond with a success message or a token
    console.log(`Login successful for user with email: ${email}`);
    res.json({ message: 'Login successful!', token});
  } else {
    // If login fails, respond with an error message or status code
    console.log(`Login failed for user with email: ${email}`);
    res.status(401).json({ message: 'Invalid credentials. Please try again.' });
  }
});

// Registration endpoint
// Registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  console.log(email)
  console.log(`Received registration request for email:, ${email}`);

  // Check if the user is already registered
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    console.log(`User already registered with email:, ${email}`);
    return res.status(409).json({ message: 'User already registered.' });
  }

  // In a real-world application, use bcrypt to hash the password before storing it
  const hashedPassword = password; // For demonstration purposes, do not store passwords like this

  // Create a new user account and store it in the `users` array
  const newUser = { email, password: hashedPassword };
  users.push(newUser);

  // Write the updated `users` array back to the JSON file
  fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8', (err) => {
    if (err) {
      console.error('Error writing users data:', err);
      return res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
    }
    // If registration is successful, respond with a success message or a token
    console.log(`User with email: ${email} registered successfully.`);
    res.json({ message: 'Registration successful!', token: 'your-auth-token' });
  });
});

// GET endpoint to fetch user information
app.get('/api/auth/userinfo', (req, res) => {
  // Check if the request contains a valid token in the headers
  const token = req.header('x-access-token');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token missing.' });
  }
  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
    }
    const { email } = decoded;
    console.log('Decoded email:', email);
    const user = users.find((user) => user.email === email);
    console.log('Found user:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Return the user information in the response
    return res.json(user);
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
