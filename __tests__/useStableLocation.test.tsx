import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useStableLocation } from '../src/hooks/useStableLocation';
import { LocationData } from '../src/utils/location.utils';

describe('useStableLocation hook', () => {
  let hookValue: LocationData | null = null;

  function TestComponent({ location, alpha }: { location: LocationData | null; alpha?: number }) {
    hookValue = useStableLocation(location, alpha);
    return null;
  }

  it('returns null initially when raw location is null', () => {
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent location={null} />);
    });
    expect(hookValue).toBeNull();
  });

  it('seeds directly on the first valid location update', () => {
    const raw: LocationData = {
      latitude: 25.053778,
      longitude: 73.889511,
      accuracy: 10,
      timestamp: Date.now(),
    };

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<TestComponent location={raw} />);
    });

    expect(hookValue).toEqual(raw);
  });

  it('applies exponential smoothing on subsequent location updates', () => {
    const raw1: LocationData = {
      latitude: 20.0,
      longitude: 70.0,
      accuracy: 10,
      timestamp: 1000,
    };

    const raw2: LocationData = {
      latitude: 40.0,
      longitude: 90.0,
      accuracy: 12,
      timestamp: 2000,
    };

    let renderer: ReactTestRenderer.ReactTestRenderer = undefined as any;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TestComponent location={raw1} alpha={0.25} />,
      );
    });

    expect(hookValue).toEqual(raw1);

    // After raw2: smoothed = 20 * 0.75 + 40 * 0.25 = 15 + 10 = 25
    // longitude = 70 * 0.75 + 90 * 0.25 = 52.5 + 22.5 = 75
    ReactTestRenderer.act(() => {
      renderer.update(<TestComponent location={raw2} alpha={0.25} />);
    });

    expect(hookValue?.latitude).toBeCloseTo(25.0);
    expect(hookValue?.longitude).toBeCloseTo(75.0);
    expect(hookValue?.accuracy).toBe(12);
  });

  it('resets to null if raw location becomes null', () => {
    const raw: LocationData = {
      latitude: 25.053778,
      longitude: 73.889511,
      accuracy: 10,
      timestamp: Date.now(),
    };

    let renderer: ReactTestRenderer.ReactTestRenderer = undefined as any;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<TestComponent location={raw} />);
    });
    expect(hookValue).not.toBeNull();

    ReactTestRenderer.act(() => {
      renderer.update(<TestComponent location={null} />);
    });
    expect(hookValue).toBeNull();
  });
});
