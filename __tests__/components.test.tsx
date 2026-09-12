import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import StackHeader from '../src/components/headers/StackHeader';
import EmptyListComponent from '../src/components/common/EmptyListComponent';
import * as navigationUtils from '../src/utils/navigation.utils';
import { Text, View } from 'react-native';

describe('StackHeader Component', () => {
  it('renders title correctly', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <StackHeader title="Attendance History" />,
      );
    });

    const root = tree!.root;
    const titleText = root.findByProps({ children: 'Attendance History' });
    expect(titleText).toBeDefined();
  });

  it('handles back button press when onBack callback is provided', () => {
    const onBackMock = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <StackHeader title="Test Title" onBack={onBackMock} />,
      );
    });

    const backButton = tree!.root.findByProps({
      testID: 'stack-header-back-button',
    });
    ReactTestRenderer.act(() => {
      backButton.props.onPress();
    });

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it('calls navigateBack when onBack is not provided', () => {
    const navigateBackSpy = jest
      .spyOn(navigationUtils, 'navigateBack')
      .mockImplementation(() => {});

    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<StackHeader title="Test Title" />);
    });

    const backButton = tree!.root.findByProps({
      testID: 'stack-header-back-button',
    });
    ReactTestRenderer.act(() => {
      backButton.props.onPress();
    });

    expect(navigateBackSpy).toHaveBeenCalledTimes(1);
    navigateBackSpy.mockRestore();
  });

  it('hides back button when showBack is false', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <StackHeader title="No Back" showBack={false} />,
      );
    });

    const buttons = tree!.root.findAllByProps({
      testID: 'stack-header-back-button',
    });
    expect(buttons.length).toBe(0);
  });

  it('renders custom rightComponent', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <StackHeader
          title="With Right"
          rightComponent={<Text testID="custom-right">Filter</Text>}
        />
      );
    });

    const rightNode = tree!.root.findByProps({ testID: 'custom-right' });
    expect(rightNode).toBeDefined();
  });
});

describe('EmptyListComponent', () => {
  it('renders default empty state text', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<EmptyListComponent />);
    });

    const root = tree!.root;
    expect(
      root.findByProps({ children: 'No attendance records yet' }),
    ).toBeDefined();
  });

  it('renders custom title and subtitle', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <EmptyListComponent
          title="Custom Empty Title"
          subtitle="Custom description text"
        />,
      );
    });

    const root = tree!.root;
    expect(
      root.findByProps({ children: 'Custom Empty Title' }),
    ).toBeDefined();
    expect(
      root.findByProps({ children: 'Custom description text' }),
    ).toBeDefined();
  });
});
