# Dynamic Account Generation System

This system generates unique account numbers and IBANs for each user in real-time, ensuring that every user gets their own distinct banking details.

## Features

- **Unique Account Numbers**: Each user gets a unique 11-digit account number
- **Unique IBANs**: Each user gets a unique IBAN in the format `PK62 RMEIT XXXX XXXX XXXX XXXX`
- **Consistent Generation**: Same user always gets the same account details
- **Real-time Generation**: Account details are generated on-demand
- **User-specific**: Account details are tied to user identifiers

## How It Works

### 1. Account Number Generation
- Format: `033XXXXXXXX` (033 is RemitGo's bank code + 8 unique digits)
- Generated using a hash of the user's unique identifier
- Ensures consistency across sessions

### 2. IBAN Generation
- Format: `PK62 RMEIT XXXX XXXX XXXX XXXX`
- Based on the generated account number
- Follows Pakistan IBAN standards
- Unique for each account number

### 3. User Identification
The system uses the following priority for user identification:
1. User ID (if available)
2. Email address
3. Phone number
4. Name
5. Fallback to 'default'

## Usage

### Basic Usage
```typescript
import { useUserAccountDetails } from '../hooks/useAccountDetails';

const DepositScreen = () => {
  const userData = {
    id: 'user_12345',
    email: 'user@example.com',
    phone: '+923001234567',
    name: 'John Doe'
  };

  const { accountDetails, isLoading, error, refreshAccountDetails } = useUserAccountDetails(userData);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      <Text>Account: {accountDetails.accountNumber}</Text>
      <Text>IBAN: {accountDetails.iban}</Text>
    </View>
  );
};
```

### Advanced Usage
```typescript
import { generateAccountDetails, generateUserId } from '../utils/accountGenerator';

// Generate account details manually
const userId = generateUserId({ email: 'user@example.com' });
const accountDetails = generateAccountDetails(userId);

console.log(accountDetails);
// Output:
// {
//   accountNumber: "03312345678",
//   iban: "PK62 SADA 1234 5678 9012 3456",
//   bankCode: "SADA",
//   branchCode: "0000"
// }
```

## File Structure

```
utils/
├── accountGenerator.ts     # Core generation logic
hooks/
├── useAccountDetails.ts    # React hook for account management
screens/
├── DepositScreen.tsx       # Example usage in UI
```

## Customization

### Changing Bank Code
To change the bank code from "033" to something else:

```typescript
// In accountGenerator.ts
export const generateAccountNumber = (userId: string): string => {
  // ... existing code ...
  
  // Change this line to use different bank code
  const accountNumber = `123${baseNumber.toString().padStart(8, '0')}`;
  
  return accountNumber;
};
```

### Changing IBAN Format
To change the IBAN format:

```typescript
// In accountGenerator.ts
export const generateIBAN = (accountNumber: string): string => {
  // ... existing code ...
  
  // Customize the IBAN format
  return `US12 BANK ${part1} ${part2} ${part3} ${part4}`;
};
```

## Security Considerations

- Account numbers are generated deterministically based on user data
- No sensitive information is stored in the generated numbers
- The system is designed for demo/development purposes
- In production, consider using a more secure generation algorithm

## Testing

### Test Different Users
```typescript
// Test with different user data
const user1 = { email: 'user1@example.com' };
const user2 = { email: 'user2@example.com' };

const details1 = generateAccountDetails(generateUserId(user1));
const details2 = generateAccountDetails(generateUserId(user2));

console.log('User 1:', details1.accountNumber);
console.log('User 2:', details2.accountNumber);
// Should output different account numbers
```

### Verify Consistency
```typescript
// Same user should always get same details
const user = { email: 'test@example.com' };
const userId = generateUserId(user);

const details1 = generateAccountDetails(userId);
const details2 = generateAccountDetails(userId);

console.log('Consistent:', details1.accountNumber === details2.accountNumber);
// Should output: true
```

## Integration with Backend

In a production environment, you might want to:

1. **Store generated details** in your database
2. **Validate account numbers** against banking regulations
3. **Use secure random generation** instead of deterministic hashing
4. **Implement rate limiting** for account generation
5. **Add audit logging** for account creation

## Troubleshooting

### Common Issues

1. **Account numbers not unique**: Ensure user identifiers are unique
2. **IBAN format errors**: Check the IBAN generation logic
3. **Loading states not working**: Verify the hook implementation
4. **Styles missing**: Add missing StyleSheet definitions

### Debug Mode

The DepositScreen includes a debug section that shows:
- User ID being used
- Generation timestamp
- Account details

This can help troubleshoot generation issues.

## Future Enhancements

- **Multiple bank support**: Generate accounts for different banks
- **Account validation**: Validate generated numbers against banking rules
- **Caching**: Cache generated details for better performance
- **Internationalization**: Support for different country formats
- **Real-time updates**: Update account details in real-time
