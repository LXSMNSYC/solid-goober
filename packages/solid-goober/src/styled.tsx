import { css, CSSAttribute } from 'goober';
import { JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

type ValidElements = keyof JSX.IntrinsicElements;
type ValidComponent<P> = (props: P) => JSX.Element;
type ValidConstructor = ValidElements | ValidComponent<any>;

type DynamicProps<T extends ValidConstructor> =
  T extends ValidElements
    ? JSX.IntrinsicElements[T]
    :
  T extends ValidComponent<infer U>
    ? U
    : never;

type Factory<P, V> = V | ((props: P) => V);

type Tagged<P> = (
  tag: Factory<P, CSSAttribute | TemplateStringsArray | string>,
  ...props: Array<Factory<P, string | number>>
) => (props: P) => JSX.Element;

export default function styled<T extends ValidConstructor>(
  component: T,
): Tagged<DynamicProps<T>> {
  return (tag, ...values) => (props) => {
    const normalizedTag = () => {
      if (typeof tag === 'function') {
        return tag(props as any);
      }
      return tag;
    };
    const normalizedValues = () => (
      values.map((value) => (
        typeof value === 'function'
          ? value(props as any)
          : value
      ))
    );
    return (
      <Dynamic
        component={component}
        {...props}
        class={css(normalizedTag(), ...normalizedValues())}
      />
    );
  }
}