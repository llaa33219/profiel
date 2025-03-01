(function() {
    let currentPopup = null;
    let currentProfileLink = null;
  
    const graphQLQuery = `
      query FIND_USERSTATUS_BY_USERNAME($id: String) {
          userstatus(id: $id) {
              id
              nickname
              username
              description
              shortUrl
              created
              profileImage {
                  id
                  name
                  label {
                      ko
                      en
                      ja
                      vn
                  }
                  filename
                  imageType
                  dimension {
                      width
                      height
                  }
                  trimmed {
                      filename
                      width
                      height
                  }
              }
              coverImage {
                  id
                  name
                  label {
                      ko
                      en
                      ja
                      vn
                  }
                  filename
                  imageType
                  dimension {
                      width
                      height
                  }
                  trimmed {
                      filename
                      width
                      height
                  }
              }
              role
              mark {
                  id
                  name
                  label {
                      ko
                      en
                      ja
                      vn
                  }
                  filename
                  imageType
                  dimension {
                      width
                      height
                  }
                  trimmed {
                      filename
                      width
                      height
                  }
              }
              studentTerm
              status {
                  project
                  projectAll
                  study
                  studyAll
                  community {
                      qna
                      tips
                      free
                  }
                  following
                  follower
                  bookmark {
                      project
                      study
                      discuss
                  }
                  userStatus
              }
              representativeContestPrizes {
                  id
                  contest {
                      name
                      url
                      enddate
                  }
                  badgeText
                  prizeName
                  prizeImageData {
                      path
                  }
                  target
                  targetSubject
                  targetType
                  created
                  category
              }
          }
      }
    `;
  
    // 팝업이 열려있는 상태에서 문서 클릭 시 팝업 제거
    function onDocumentClick(e) {
      if (
        currentPopup &&
        !currentPopup.contains(e.target) &&
        currentProfileLink &&
        !currentProfileLink.contains(e.target)
      ) {
        currentPopup.remove();
        currentPopup = null;
        currentProfileLink = null;
        window.removeEventListener('scroll', updatePopupPosition);
        window.removeEventListener('resize', updatePopupPosition);
        document.removeEventListener('click', onDocumentClick);
      }
    }
  
    // 팝업의 위치를 a태그 아래에 따라가도록 업데이트
    function updatePopupPosition() {
      if (!currentPopup || !currentProfileLink) return;
      const rect = currentProfileLink.getBoundingClientRect();
      currentPopup.style.top = `${rect.bottom + 5}px`;
      currentPopup.style.left = `${rect.left}px`;
    }
  
    // 클릭한 a태그 처리 함수
    function handleProfileClick(aElem) {
      // 같은 a태그를 다시 클릭하면 팝업 토글 처리
      if (currentPopup && currentProfileLink === aElem) {
        currentPopup.remove();
        currentPopup = null;
        currentProfileLink = null;
        window.removeEventListener('scroll', updatePopupPosition);
        window.removeEventListener('resize', updatePopupPosition);
        document.removeEventListener('click', onDocumentClick);
        return;
      }
  
      // 다른 a태그 클릭 시 기존 팝업 제거
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
        currentProfileLink = null;
        window.removeEventListener('scroll', updatePopupPosition);
        window.removeEventListener('resize', updatePopupPosition);
        document.removeEventListener('click', onDocumentClick);
      }
  
      const href = aElem.getAttribute('href');
      if (!href) return;
      const parts = href.split('/');
      const profileId = parts[2];
      if (!profileId) return;
  
      const referrer = window.location.origin + href + "/project?sort=created&term=all&isOpen=all";
  
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
        "6q3XvSHT--_zLb3fFL2ZWCXX1ILFkPpdp0tk";
      const xToken = document.querySelector('meta[name="x-token"]')?.getAttribute('content') ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZG5vIjoiYjA2NDBiNjAtYjQ5Ny0xMWViLWI0N2EtMjQ2ZTk2NDg3MjljIiwiZXhwIjoxNzQyMDA4ODE0LCJpYXQiOjE3NDA3OTkyMTR9.DZo9n7ZJYKrO_BMXd1Nj-QM9zTNmcMAv2utjzYQoFjs";
  
      const requestBody = {
        query: graphQLQuery,
        variables: { id: profileId }
      };
  
      fetch("https://playentry.org/graphql/FIND_USERSTATUS_BY_USERNAME", {
        headers: {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9,ko;q=0.8",
          "content-type": "application/json",
          "csrf-token": csrfToken,
          "priority": "u=1, i",
          "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Linux\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-client-type": "Client",
          "x-token": xToken
        },
        referrer: referrer,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(requestBody),
        method: "POST",
        mode: "cors",
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          const user = data?.data?.userstatus;
          if (!user) return;
  
          const nickname = user.nickname || '';
          const description = user.description || '';
          const followingCount = user.status?.following ?? 0;
          const followerCount = user.status?.follower ?? 0;
  
          // a태그의 computed style에서 background-image 추출 (첫 번째 url)
          const computedBg = getComputedStyle(aElem).backgroundImage;
          let profileImageUrl = '';
          if (computedBg) {
            const match = computedBg.match(/url\(["']?([^"')]+)["']?\)/);
            if (match && match[1]) {
              profileImageUrl = match[1];
            }
          }
          if (!profileImageUrl) {
            profileImageUrl = '/uploads/86/e8/86e8222fm7plo43g0006a2c94308ph4l.png';
          }
  
          // 팝업 생성 - overlay 형식으로 document.body에 추가
          const popup = document.createElement('div');
          popup.id = 'customProfilePopup';
          popup.classList.add('customProfilePopup');
          const rect = aElem.getBoundingClientRect();
          popup.style.top = `${rect.bottom + 5}px`;
          popup.style.left = `${rect.left}px`;
  
          popup.addEventListener('click', function(e) {
            e.stopPropagation();
          });
  
          // 레이아웃: 프로필 이미지와 요청 결과로 받아온 닉네임, 팔로잉/팔로워, description이 표시됨  
          // 프로필 이미지는 <img> 태그로 대체하여 GIF, SVG 등 애니메이션 이미지도 정상 재생됨  
          // "팔로잉"과 "팔로워" 라벨은 진한 회색(#555), 숫자는 검은색(#000)으로 설정
          // 닉네임 부분은 절대로 줄바꿈이 발생하지 않도록 white-space와 display 속성을 추가함
          popup.innerHTML = `
            <div class="customProfilePopup-content">
              <div class="customProfilePopup-header">
                <a href="${href}">
                  <img src="${profileImageUrl}" class="customProfilePopup-img" />
                </a>
                <div id="popupNickname" class="customProfilePopup-nickname">${nickname}</div>
              </div>
              <div id="popupFollow" class="customProfilePopup-follow">
                <span class="customProfilePopup-follow-label">팔로잉</span> <span class="customProfilePopup-follow-count">${followingCount}</span> 
                <span class="customProfilePopup-follow-label">팔로워</span> <span class="customProfilePopup-follow-count">${followerCount}</span>
              </div>
              <div id="popupDesc" class="customProfilePopup-desc">${description}</div>
            </div>
          `;
  
          document.body.appendChild(popup);
          currentPopup = popup;
          currentProfileLink = aElem;
          window.addEventListener('scroll', updatePopupPosition);
          window.addEventListener('resize', updatePopupPosition);
          document.addEventListener('click', onDocumentClick);
        })
        .catch(err => {
          console.error('데이터 가져오기 실패:', err);
        });
    }
  
    document.addEventListener(
      "click",
      function(e) {
        const aElem = e.target.closest("a.css-18bdrlk.enx4swp0");
        if (aElem) {
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
          handleProfileClick(aElem);
        }
      },
      true
    );
})();
