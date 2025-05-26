import { ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function HorizontalInfiniteScroll({ children }: { children: ReactNode[] }) {
  return (
    <Swiper
      className='w-full'
      spaceBetween={50}
      centeredSlides={true}
      scrollbar={{ draggable: true }}
      loop={true}
      // initialSlide={3}
      // loopAdditionalSlides={ 3 * 2 }
      slidesPerView="auto"
      onSlideChange={() => console.log('slide change')}
      onSwiper={(swiper) => console.log(swiper)}
    >
      {children.map((child: ReactNode, index: number) => (
        <SwiperSlide key={index} className="max-w-2xl w-full">
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}