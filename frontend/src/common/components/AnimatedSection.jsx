import useScrollReveal from '../hooks/useScrollReveal'

const animations = {
  up: 'fade-in-up',
  down: 'fade-in-down',
  left: 'fade-in-left',
  right: 'fade-in-right',
  scale: 'scale-in',
  fade: 'fade-in',
}

export default function AnimatedSection({
  children,
  animation = 'up',
  delay = 0,
  className = '',
  as: Tag = 'div',
  threshold,
  rootMargin,
  triggerOnce,
}) {
  const [ref, isVisible] = useScrollReveal({ threshold, rootMargin, triggerOnce })

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isVisible
          ? `animate-${animations[animation] || 'fade-in-up'}`
          : 'opacity-0 translate-y-8'
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      {children}
    </Tag>
  )
}
