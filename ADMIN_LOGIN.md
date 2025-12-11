# TOMATO Admin Login Credentials

## Admin Panel Access

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5175 |
| **Email** | admin@tomato.com |
| **Password** | Admin@123 |

## How to Login

1. Open your browser and go to http://localhost:5175
2. Enter email: `admin@tomato.com`
3. Enter password: `admin123`
4. Click "Login" button

## Admin Features

Once logged in, you can:

- **Add** - Add new food items to the menu
- **List** - View and manage all food items
- **Orders** - View customer orders and update status

## Troubleshooting

If login doesn't work:

1. Make sure backend is running: `cd backend && npm run server`
2. Make sure admin is running: `cd admin && npm run dev`
3. Check browser console (F12) for errors
4. Clear browser localStorage and try again

## Security Note

⚠️ Change these credentials in production!
