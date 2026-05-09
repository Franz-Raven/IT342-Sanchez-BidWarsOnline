/**
 * Unit tests for HiloGameControls component
 * Tests cover:
 * - TC-HILO-001: Start New HiLo Game
 * - TC-HILO-007: Insufficient Balance Prevention
 * - Component rendering and user interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HiloGameControls } from '@/features/hilo/components/hilo-game-controls';
import '@testing-library/jest-dom';

// Mock the API calls
jest.mock('@/features/hilo/api/hilo', () => ({
  placeHiloBet: jest.fn(),
  checkActiveSession: jest.fn(),
}));

describe('HiloGameControls Component', () => {
  const mockOnGameStart = jest.fn();
  const mockOnError = jest.fn();

  const defaultProps = {
    balance: 100,
    gameState: 'IDLE' as const,
    onGameStart: mockOnGameStart,
    onError: mockOnError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-HILO-001: Rendering test
   * Verify component renders correctly in IDLE state
   */
  test('renders game controls in IDLE state', () => {
    render(<HiloGameControls {...defaultProps} />);

    expect(screen.getByPlaceholderText(/bet amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start game/i })).not.toBeDisabled();
  });

  /**
   * TC-HILO-001: Start New HiLo Game
   * Verify user can input bet amount and start game
   */
  test('allows user to input bet amount and start game', async () => {
    const { placeHiloBet } = require('@/features/hilo/api/hilo');
    placeHiloBet.mockResolvedValue({
      sessionId: 1,
      currentCardRank: 'Seven',
      currentCardSuit: 'Hearts',
      currentCardValue: 7,
      currentPot: 10,
      streakCount: 0,
      higherProbability: 46.15,
      lowerProbability: 46.15,
      equalProbability: 7.69,
    });

    render(<HiloGameControls {...defaultProps} />);

    // Input bet amount
    const betInput = screen.getByPlaceholderText(/bet amount/i);
    fireEvent.change(betInput, { target: { value: '10' } });
    expect(betInput).toHaveValue('10');

    // Click start game button
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(placeHiloBet).toHaveBeenCalledWith(10);
      expect(mockOnGameStart).toHaveBeenCalled();
    });
  });

  /**
   * TC-HILO-007: Insufficient Balance Prevention
   * Verify warning when bet amount exceeds balance
   */
  test('shows error when bet amount exceeds balance', () => {
    render(<HiloGameControls {...defaultProps} balance={5} />);

    const betInput = screen.getByPlaceholderText(/bet amount/i);
    fireEvent.change(betInput, { target: { value: '10' } });

    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    expect(mockOnError).toHaveBeenCalledWith('Insufficient balance');
    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  /**
   * Test bet amount validation - minimum bet
   */
  test('prevents starting game with bet amount below minimum', () => {
    render(<HiloGameControls {...defaultProps} />);

    const betInput = screen.getByPlaceholderText(/bet amount/i);
    fireEvent.change(betInput, { target: { value: '0.5' } });

    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('minimum'));
    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  /**
   * Test game controls disabled during PLAYING state
   */
  test('disables bet input and start button when game is playing', () => {
    render(<HiloGameControls {...defaultProps} gameState="PLAYING" />);

    const betInput = screen.getByPlaceholderText(/bet amount/i);
    const startButton = screen.getByRole('button', { name: /start game/i });

    expect(betInput).toBeDisabled();
    expect(startButton).toBeDisabled();
  });

  /**
   * Test quick bet buttons
   */
  test('quick bet buttons set bet amount correctly', () => {
    render(<HiloGameControls {...defaultProps} />);

    const quickBet10Button = screen.getByRole('button', { name: '10' });
    const quickBet25Button = screen.getByRole('button', { name: '25' });
    const quickBet50Button = screen.getByRole('button', { name: '50' });

    const betInput = screen.getByPlaceholderText(/bet amount/i) as HTMLInputElement;

    // Test 10 button
    fireEvent.click(quickBet10Button);
    expect(betInput.value).toBe('10');

    // Test 25 button
    fireEvent.click(quickBet25Button);
    expect(betInput.value).toBe('25');

    // Test 50 button
    fireEvent.click(quickBet50Button);
    expect(betInput.value).toBe('50');
  });

  /**
   * Test balance display
   */
  test('displays current balance correctly', () => {
    render(<HiloGameControls {...defaultProps} balance={123.45} />);

    expect(screen.getByText(/balance/i)).toBeInTheDocument();
    expect(screen.getByText(/123\.45/)).toBeInTheDocument();
  });

  /**
   * Test error handling for API failures
   */
  test('handles API error gracefully', async () => {
    const { placeHiloBet } = require('@/features/hilo/api/hilo');
    placeHiloBet.mockRejectedValue(new Error('Network error'));

    render(<HiloGameControls {...defaultProps} />);

    const betInput = screen.getByPlaceholderText(/bet amount/i);
    fireEvent.change(betInput, { target: { value: '10' } });

    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('error'));
    });
  });
});
