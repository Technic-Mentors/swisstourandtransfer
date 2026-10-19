import useWhatsApp from '../../hooks/useWhatsApp';
import { Button, WhatsAppIcon } from './index';

/**
 * The site-wide booking button.
 *
 * Renders a real anchor so middle-click and "open in new tab" behave, and
 * records the click on the way out. Pass a vehicle to get its name into the
 * message automatically.
 */
export default function WhatsAppButton({
  vehicle = null,
  city = '',
  service = '',
  custom = '',
  pageType = 'page',
  children = 'Book via WhatsApp',
  variant = 'whatsapp',
  size = 'md',
  full = false,
  showIcon = true,
  className = '',
  ...rest
}) {
  const { buildUrl, track } = useWhatsApp();

  const href = buildUrl({ vehicle, city, service, custom });

  return (
    <Button
      href={href}
      variant={variant}
      size={size}
      full={full}
      className={className}
      icon={showIcon ? <WhatsAppIcon /> : null}
      onClick={() => track({ vehicle, pageType })}
      {...rest}
    >
      {children}
    </Button>
  );
}
