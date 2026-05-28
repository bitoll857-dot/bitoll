-- Bitoll Platform - starter content
-- Run after schema.sql. The app reads these rows from Supabase.

insert into public.services (
  slug,
  title,
  short_description,
  description,
  image_key,
  features,
  benefits,
  audience,
  technologies,
  experience,
  sort_order,
  active
)
values
(
  'vedacao-eletrica',
  'Vedacao Eletrica',
  'Protecao perimetral moderna e inteligente.',
  'Solucoes profissionais de vedacao eletrica para residencias, empresas e ambientes industriais.',
  'vedacao-eletrica',
  '["Protecao perimetral inteligente","Instalacao profissional","Monitoramento continuo","Equipamentos modernos"]'::jsonb,
  '["Maior seguranca","Protecao 24 horas","Resposta rapida"]'::jsonb,
  '["Residencias","Empresas","Industrias","Condominios"]'::jsonb,
  '["Sensores inteligentes","Central eletronica","Monitoramento remoto"]'::jsonb,
  'Seguranca moderna para ambientes residenciais e empresariais.',
  1,
  true
),
(
  'cctv-monitoramento',
  'CCTV & Monitoramento',
  'Monitoramento inteligente com cameras modernas.',
  'Sistemas modernos de vigilancia eletronica com monitoramento remoto, gravacao inteligente e cameras de alta definicao.',
  'cctv-monitoramento',
  '["Cameras HD","Monitoramento remoto","Gravacao inteligente","Visao noturna"]'::jsonb,
  '["Maior controlo","Monitoramento em tempo real","Protecao continua"]'::jsonb,
  '["Residencias","Empresas","Lojas","Escritorios"]'::jsonb,
  '["Cameras IP","DVR/NVR","Cloud monitoring"]'::jsonb,
  'Vigilancia e controlo de ambientes com tecnologia inteligente.',
  2,
  true
),
(
  'motores-de-portoes',
  'Motores de Portoes',
  'Automacao eficiente para portoes modernos.',
  'Solucoes modernas de automacao para portoes residenciais e industriais.',
  'motores-de-portoes',
  '["Automacao residencial","Motores modernos","Controlo remoto","Instalacao profissional"]'::jsonb,
  '["Maior comodidade","Seguranca automatizada","Controle remoto"]'::jsonb,
  '["Residencias","Empresas","Condominios","Armazens"]'::jsonb,
  '["Motores automaticos","Controlo remoto","Sensores inteligentes"]'::jsonb,
  'Conforto, seguranca e automacao inteligente.',
  3,
  true
),
(
  'tecnologia-inteligente',
  'Tecnologia Inteligente',
  'Automacao e infraestrutura tecnologica moderna.',
  'Solucoes em automacao, controlo de acesso e infraestrutura tecnologica para ambientes conectados.',
  'tecnologia-inteligente',
  '["Automacao inteligente","Infraestrutura moderna","Integracao tecnologica","Controlo de acesso"]'::jsonb,
  '["Maior eficiencia","Ambientes inteligentes","Gestao moderna"]'::jsonb,
  '["Empresas","Industrias","Escritorios","Projetos tecnologicos"]'::jsonb,
  '["IoT","Automacao","Sistemas inteligentes"]'::jsonb,
  'Infraestrutura tecnologica para ambientes conectados.',
  4,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  image_key = excluded.image_key,
  features = excluded.features,
  benefits = excluded.benefits,
  audience = excluded.audience,
  technologies = excluded.technologies,
  experience = excluded.experience,
  sort_order = excluded.sort_order,
  active = excluded.active;

delete from public.service_products where source = 'Bitoll seed';

insert into public.service_products (
  service_slug,
  structure,
  name,
  unit,
  quantity_label,
  estimated_quantity,
  unit_price,
  source,
  brand,
  model,
  system,
  category,
  description,
  detail,
  required
)
values
('cctv-monitoramento','basica','Camera bullet IP 4MP','Un','4 unidades',4,6500,'Bitoll seed','Hikvision','DS-2CD1043G2','IP','Camera','Camera externa para pontos principais.','Boa para entradas, corredores e areas externas.',true),
('cctv-monitoramento','basica','NVR 8 canais','Un','1 unidade',1,18500,'Bitoll seed','Hikvision','DS-7608NI','IP','Gravador','Gravador de rede para cameras IP.','Permite gravacao e acesso remoto.',true),
('cctv-monitoramento','media','Camera bullet IP 4MP','Un','8 unidades',8,6500,'Bitoll seed','Hikvision','DS-2CD1043G2','IP','Camera','Camera externa para pontos principais.','Boa para entradas, corredores e areas externas.',true),
('cctv-monitoramento','media','Disco rigido CCTV 2TB','Un','1 unidade',1,9000,'Bitoll seed','Western Digital','Purple 2TB','Armazenamento','Disco','Armazenamento para gravacao continua.','Indicado para sistemas CCTV.',true),
('vedacao-eletrica','basica','Energizador profissional','Un','1 unidade',1,18500,'Bitoll seed','JFL','ECR-18 Plus','Perimetral','Central','Central que alimenta a vedacao eletrica.','Controla pulso e alerta do sistema.',true),
('vedacao-eletrica','basica','Fio de aluminio','Rolo','6 rolos',6,1800,'Bitoll seed','Intelbras','0.9mm','Condutor','Fio','Fio para linhas eletrificadas.','Usado no perimetro protegido.',true),
('vedacao-eletrica','media','Hastes com isoladores','Un','35 unidades',35,350,'Bitoll seed','Genial','4 isoladores','Estrutura','Haste','Suportes para manter as linhas alinhadas.','Instalacao em muro ou estrutura preparada.',true),
('motores-de-portoes','basica','Motor de portao deslizante','Un','1 unidade',1,24500,'Bitoll seed','PPA','DZ Rio 400','Automacao','Motor','Motor para portao residencial.','Indicado para uso residencial.',true),
('motores-de-portoes','basica','Controlos remotos','Un','2 unidades',2,1200,'Bitoll seed','PPA','Tok','Acesso','Controle','Comandos para abertura remota.','Permite uso diario com conforto.',true),
('tecnologia-inteligente','basica','Controlador de acesso','Un','1 unidade',1,16500,'Bitoll seed','ZKTeco','Standalone','Acesso','Controle','Controle simples de entrada.','Indicado para escritorios e pequenas empresas.',true);

delete from public.promotions
where slug in ('cctv-premium', 'vedacao-eletrica-inteligente');

insert into public.promotions (
  slug,
  service_slug,
  title,
  short_description,
  description,
  discount_label,
  badge,
  image,
  active,
  start_date,
  end_date,
  technologies,
  features,
  articles,
  installation_fee,
  discount_amount,
  currency
)
values
(
  'cctv-premium',
  'cctv-monitoramento',
  'CCTV Premium 8 Cameras IP',
  'Pacote completo de CCTV IP com gravacao, acesso remoto e instalacao profissional.',
  'Solucao indicada para residencias grandes, lojas e escritorios que precisam de monitoramento nitido.',
  '20% OFF',
  'Oferta Limitada',
  'https://source.unsplash.com/1200x720/?home-security,cctv-camera',
  true,
  '2026-05-20',
  '2026-06-15',
  '["CCTV IP","Acesso remoto","Gravacao inteligente"]'::jsonb,
  '["8 cameras IP","NVR com disco incluido","Acesso via smartphone","Instalacao e configuracao"]'::jsonb,
  '[{"id":"promo-cctv-cam","name":"Camera bullet IP 4MP","brand":"Hikvision","model":"DS-2CD1043G2","system":"IP","quantity":8,"unitPrice":6500,"description":"Cameras externas com imagem nitida."},{"id":"promo-cctv-nvr","name":"NVR 8 canais","brand":"Hikvision","model":"DS-7608NI","system":"IP","quantity":1,"unitPrice":18500,"description":"Gravador de rede para gerir cameras."}]'::jsonb,
  22000,
  21800,
  'MZN'
),
(
  'vedacao-eletrica-inteligente',
  'vedacao-eletrica',
  'Vedacao Eletrica Inteligente',
  'Sistema perimetral completo com energizador, sirene, bateria e sinalizacao.',
  'Solucao para reforcar a seguranca perimetral de residencias, condominios e pequenas empresas.',
  '15% OFF',
  'Mais Vendido',
  'https://source.unsplash.com/1200x720/?electric-fence,security-wall',
  true,
  '2026-05-22',
  '2026-06-10',
  '["Vedacao eletrica","Sirene","Backup de energia"]'::jsonb,
  '["Energizador profissional","Sirene e sinalizador","Bateria de backup","Placas de aviso"]'::jsonb,
  '[{"id":"promo-ved-central","name":"Energizador profissional","brand":"JFL","model":"ECR-18 Plus","system":"Perimetral","quantity":1,"unitPrice":18500,"description":"Central que alimenta a vedacao eletrica."},{"id":"promo-ved-fio","name":"Fio de aluminio","brand":"Intelbras","model":"0.9mm","system":"Condutor","quantity":6,"unitPrice":1800,"description":"Rolos de fio para linhas eletrificadas."}]'::jsonb,
  18000,
  9600,
  'MZN'
);
